import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { join } from 'path'

// electron 모킹을 먼저 수행
jest.mock('electron', () => ({
  BrowserWindow: class MockBrowserWindow {},
  app: {
    getPath: jest.fn(() => '/tmp/test-app-data')
  },
  dialog: {},
  ipcMain: {},
  globalShortcut: {}
}))

// fs 모듈 모킹
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    rm: jest.fn(),
    stat: jest.fn()
  },
  constants: {
    R_OK: 4,
    W_OK: 2,
    F_OK: 0
  }
}))

import { promises as fs } from 'fs'
import { FileVaultRepository } from '../../../main/vault/repositories/vault-repository'
import { mockVaultMetadata, createTempPath } from '../../fixtures/vault-fixtures'
import { VaultPathUtils } from '../../../config/vault-paths'
import { VAULT_DIRECTORIES } from '../../../config/vault-constants'

const mockFs = fs as jest.Mocked<typeof fs>

describe('FileVaultRepository', () => {
  let repository: FileVaultRepository
  let testVaultPath: string

  beforeEach(() => {
    testVaultPath = createTempPath('vault')

    // 모든 mock 완전 초기화
    jest.clearAllMocks()
    jest.resetAllMocks()

    // 새로운 인스턴스 생성
    repository = new FileVaultRepository()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('validatePath', () => {
    test('should validate existing writable directory', async () => {
      // 모든 fs 호출이 성공하도록 설정
      mockFs.access.mockResolvedValue(undefined)
      mockFs.stat.mockResolvedValue({
        isDirectory: () => true
      } as any)
      mockFs.readFile.mockRejectedValue(new Error('ENOENT'))

      const result = await repository.validatePath(testVaultPath)

      // access가 2번 호출되었는지 확인 (존재 확인 + 쓰기 권한)
      expect(mockFs.access).toHaveBeenCalledTimes(2)
      expect(mockFs.access).toHaveBeenNthCalledWith(1, testVaultPath)
      expect(mockFs.access).toHaveBeenNthCalledWith(2, testVaultPath, 2) // W_OK = 2
      expect(mockFs.stat).toHaveBeenCalledTimes(1)
      expect(mockFs.readFile).toHaveBeenCalledTimes(1)

      expect(result.isValid).toBe(true)
      expect(result.canWrite).toBe(true)
      expect(result.isExisting).toBe(false)
      expect(result.error).toBeUndefined()
    })

    test('should handle non-existent directory', async () => {
      // 첫 번째 access (존재 확인)에서 ENOENT 에러
      const error = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException
      error.code = 'ENOENT'
      mockFs.access.mockRejectedValueOnce(error)

      const result = await repository.validatePath(testVaultPath)

      expect(result.isValid).toBe(false)
      expect(result.canWrite).toBe(false)
      expect(result.error).toBe('Path does not exist or is not accessible')
    })

    test('should handle permission denied', async () => {
      // 첫 번째 access는 성공, 두 번째(쓰기 권한)는 실패
      mockFs.access.mockResolvedValueOnce(undefined) // 첫 번째 호출
      mockFs.stat.mockResolvedValue({
        isDirectory: () => true
      } as any)
      const error = new Error('EACCES: permission denied') as NodeJS.ErrnoException
      error.code = 'EACCES'
      mockFs.access.mockRejectedValueOnce(error) // 두 번째 호출 (쓰기 권한 체크)

      const result = await repository.validatePath(testVaultPath)

      expect(result.isValid).toBe(false)
      expect(result.canWrite).toBe(false)
      expect(result.error).toBe('No write permission for this directory')
    })

    test('should handle file instead of directory', async () => {
      // 첫 번째 access (존재 확인) - 성공
      mockFs.access.mockResolvedValueOnce(undefined)
      // stat 호출 - 파일임 (디렉토리 아님)
      mockFs.stat.mockResolvedValue({
        isDirectory: () => false
      } as any)

      const result = await repository.validatePath(testVaultPath)

      expect(result.isValid).toBe(false)
      expect(result.canWrite).toBe(false)
      expect(result.error).toBe('Path is not a directory')
    })
  })

  describe('createStructure', () => {
    test('should create complete vault structure', async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await repository.createStructure(testVaultPath, 'Test Vault')

      // 모든 디렉토리 생성 확인
      expect(mockFs.mkdir).toHaveBeenCalledWith(VaultPathUtils.getMetadataDir(testVaultPath), {
        recursive: true
      })
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testVaultPath, VAULT_DIRECTORIES.WORKSPACES.PERSONAL),
        {
          recursive: true
        }
      )
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testVaultPath, VAULT_DIRECTORIES.WORKSPACES.PERSONAL, 'channel-daily'),
        { recursive: true }
      )
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testVaultPath, VAULT_DIRECTORIES.WORKSPACES.PERSONAL, 'channel-ideas'),
        { recursive: true }
      )

      // 총 4번의 writeFile 호출 확인 (vault.json, workspaces.json, .workspace.json, welcome.md)
      expect(mockFs.writeFile).toHaveBeenCalledTimes(4)

      // vault.json 생성 확인
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        VaultPathUtils.getVaultMetadataPath(testVaultPath),
        expect.stringContaining('"name": "Test Vault"'),
        'utf-8'
      )

      // welcome.md 생성 확인
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        join(testVaultPath, VAULT_DIRECTORIES.WORKSPACES.PERSONAL, 'channel-ideas', 'welcome.md'),
        expect.stringContaining('# Welcome to not.e!'),
        'utf-8'
      )
    })

    test('should handle directory creation failure', async () => {
      const error = new Error('Permission denied')
      mockFs.mkdir.mockRejectedValue(error)

      await expect(repository.createStructure(testVaultPath, 'Test Vault')).rejects.toThrow(
        'Permission denied'
      )
    })
  })

  describe('loadMetadata', () => {
    test('should load existing vault metadata', async () => {
      const metadataJson = JSON.stringify(mockVaultMetadata, null, 2)
      mockFs.readFile.mockResolvedValue(metadataJson)

      const result = await repository.loadMetadata(testVaultPath)

      expect(result).toEqual(mockVaultMetadata)
      expect(mockFs.readFile).toHaveBeenCalledWith(
        VaultPathUtils.getVaultMetadataPath(testVaultPath),
        'utf-8'
      )
    })

    test('should return null for non-existent metadata', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException
      error.code = 'ENOENT'
      mockFs.readFile.mockRejectedValue(error)

      const result = await repository.loadMetadata(testVaultPath)

      expect(result).toBeNull()
    })

    test('should handle invalid JSON in metadata file', async () => {
      mockFs.readFile.mockResolvedValue('invalid json content')

      const result = await repository.loadMetadata(testVaultPath)

      // 실제 구현에서는 JSON 파싱 에러 시 null을 반환
      expect(result).toBeNull()
    })
  })

  describe('saveMetadata', () => {
    test('should save metadata to vault.json', async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      mockFs.writeFile.mockResolvedValue(undefined)

      await repository.saveMetadata(testVaultPath, mockVaultMetadata)

      expect(mockFs.mkdir).toHaveBeenCalledWith(VaultPathUtils.getMetadataDir(testVaultPath), {
        recursive: true
      })
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        VaultPathUtils.getVaultMetadataPath(testVaultPath),
        JSON.stringify(mockVaultMetadata, null, 2),
        'utf-8'
      )
    })

    test('should handle write failure', async () => {
      mockFs.mkdir.mockResolvedValue(undefined)
      const error = new Error('Disk full')
      mockFs.writeFile.mockRejectedValue(error)

      await expect(repository.saveMetadata(testVaultPath, mockVaultMetadata)).rejects.toThrow(
        'Failed to save vault metadata: Disk full'
      )
    })
  })
})
