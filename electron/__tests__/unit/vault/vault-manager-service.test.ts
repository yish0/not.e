import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'

// electron 모킹
jest.mock('electron', () => ({
  BrowserWindow: class MockBrowserWindow {},
  app: {
    getPath: jest.fn((name: string) => {
      switch (name) {
        case 'home':
          return '/tmp/test-home'
        case 'userData':
          return '/tmp/test-app-data'
        default:
          return '/tmp/test-app-data'
      }
    })
  },
  dialog: {},
  ipcMain: {},
  globalShortcut: {}
}))

// GlobalAppPaths 모킹
jest.mock('../../../config/vault-paths', () => ({
  GlobalAppPaths: {
    getGlobalAppDir: jest.fn(() => '/tmp/test-global-app'),
    getGlobalAppConfigPath: jest.fn(() => '/tmp/test-global-app/app-config.json'),
    getVaultSelectionPath: jest.fn(() => '/tmp/test-global-app/vault-selection.json'),
    getGlobalShortcutsPath: jest.fn(() => '/tmp/test-global-app/shortcuts.json')
  },
  VaultPaths: jest.fn(),
  VaultPathUtils: {
    forVault: jest.fn(() => ({ getAppConfigDir: jest.fn(() => '/tmp/test-vault/.note') })),
    getMetadataDir: jest.fn(() => '/tmp/test-vault/.note'),
    getAppConfigDir: jest.fn(() => '/tmp/test-vault/.note'),
    getVaultMetadataPath: jest.fn(() => '/tmp/test-vault/.note/vault-metadata.json'),
    getVaultAppConfigPath: jest.fn(() => '/tmp/test-vault/.note/app-config.json'),
    getAppConfigPath: jest.fn(() => '/tmp/test-vault/.note/app-config.json')
  }
}))

// fs 모킹
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn()
  }
}))

// VaultSelectionConfigRepository 모킹
jest.mock('../../../main/vault/repositories/vault-selection-config-repository')
jest.mock('../../../main/vault/repositories/app-settings-repository')

import { DefaultVaultManagerService } from '../../../main/vault/services/vault-manager-service'
import { FileVaultSelectionConfigRepository } from '../../../main/vault/repositories/vault-selection-config-repository'
import { FileAppSettingsRepository } from '../../../main/vault/repositories/app-settings-repository'
import type {
  AppConfigRepository,
  VaultInitializerService,
  AppConfig,
  VaultConfig,
  VaultInitResult
} from '../../../main/vault/types/vault-types'

// Mock 클래스들
const MockFileVaultSelectionConfigRepository = FileVaultSelectionConfigRepository as jest.MockedClass<
  typeof FileVaultSelectionConfigRepository
>
const MockFileAppSettingsRepository = FileAppSettingsRepository as jest.MockedClass<
  typeof FileAppSettingsRepository
>

describe('DefaultVaultManagerService', () => {
  let service: DefaultVaultManagerService
  let mockConfigRepository: jest.Mocked<AppConfigRepository>
  let mockInitializerService: jest.Mocked<VaultInitializerService>
  let mockAppConfig: AppConfig
  let mockVaultSelectionRepo: any
  let mockAppSettingsRepo: any

  beforeEach(() => {
    // AppConfig mock 데이터
    mockAppConfig = {
      recentVaults: [
        {
          path: '/test/vault1',
          name: 'Test Vault 1',
          createdAt: '2024-01-01T00:00:00.000Z',
          lastAccessed: '2024-01-01T12:00:00.000Z'
        },
        {
          path: '/test/vault2',
          name: 'Test Vault 2',
          createdAt: '2024-01-02T00:00:00.000Z',
          lastAccessed: '2024-01-02T12:00:00.000Z'
        }
      ],
      showVaultSelector: true,
      currentVault: '/test/vault1',
      lastUsedVault: '/test/vault1',
      windowMode: 'normal',
      toggleSettings: {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
    }

    // Mock repositories and services
    mockConfigRepository = {
      load: jest.fn(() => Promise.resolve(mockAppConfig)),
      save: jest.fn(() => Promise.resolve()),
      getPath: jest.fn(() => '/test/config/path'),
      setCurrentVaultPath: jest.fn(),
      migrateFromLegacyConfig: jest.fn(() => Promise.resolve())
    } as jest.Mocked<AppConfigRepository>

    mockInitializerService = {
      initialize: jest.fn(),
      validate: jest.fn()
    }

    // Mock the file repositories
    mockVaultSelectionRepo = {
      load: jest.fn(() => Promise.resolve({
        recentVaults: mockAppConfig.recentVaults,
        showVaultSelector: mockAppConfig.showVaultSelector,
        currentVault: mockAppConfig.currentVault
      })),
      save: jest.fn(() => Promise.resolve()),
      getPath: jest.fn(() => '/tmp/test-vault-selection.json')
    }

    mockAppSettingsRepo = {
      load: jest.fn(() => Promise.resolve(mockAppConfig)),
      save: jest.fn(() => Promise.resolve()),
      getPath: jest.fn(() => '/tmp/test-app-settings.json'),
      ensureConfigDirectory: jest.fn(() => Promise.resolve())
    }

    MockFileVaultSelectionConfigRepository.mockImplementation(() => mockVaultSelectionRepo as any)
    MockFileAppSettingsRepository.mockImplementation(() => mockAppSettingsRepo as any)

    // 서비스 인스턴스 생성
    service = new DefaultVaultManagerService(mockConfigRepository, mockInitializerService)
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('initialization', () => {
    test('should initialize with default config', () => {
      const newService = new DefaultVaultManagerService(
        mockConfigRepository,
        mockInitializerService
      )
      expect(newService.shouldShowSelector()).toBe(true)
    })

    test('should load app config on initialize', async () => {
      await service.initialize()

      expect(mockConfigRepository.migrateFromLegacyConfig).toHaveBeenCalledTimes(1)
    })
  })

  describe('getCurrentVault', () => {
    test('should return current vault when exists', async () => {
      await service.initialize()

      const result = await service.getCurrentVault()

      expect(result).toEqual({
        path: '/test/vault1',
        name: 'Test Vault 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastAccessed: '2024-01-01T12:00:00.000Z'
      })
    })

    test('should return null when no current vault', async () => {
      mockAppConfig.currentVault = undefined
      await service.initialize()

      const result = await service.getCurrentVault()

      expect(result).toBeNull()
    })

    test('should return null when current vault not in recent vaults', async () => {
      mockAppConfig.currentVault = '/test/nonexistent'
      await service.initialize()

      const result = await service.getCurrentVault()

      expect(result).toBeNull()
    })
  })

  describe('setCurrentVault', () => {
    test('should set current vault successfully', async () => {
      const mockVault: VaultConfig = {
        path: '/test/new-vault',
        name: 'New Vault',
        createdAt: '2024-01-03T00:00:00.000Z',
        lastAccessed: '2024-01-03T12:00:00.000Z'
      }

      const mockInitResult: VaultInitResult = {
        success: true,
        vault: mockVault
      }

      mockInitializerService.initialize.mockResolvedValue(mockInitResult)
      await service.initialize()

      const result = await service.setCurrentVault('/test/new-vault')

      expect(mockInitializerService.initialize).toHaveBeenCalledWith('/test/new-vault')
      expect(result).toEqual(mockInitResult)
      expect(mockVaultSelectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentVault: '/test/new-vault'
        })
      )
    })

    test('should handle initialization failure', async () => {
      const mockInitResult: VaultInitResult = {
        success: false,
        error: 'Invalid vault path'
      }

      mockInitializerService.initialize.mockResolvedValue(mockInitResult)
      await service.initialize()

      const result = await service.setCurrentVault('/test/invalid')

      expect(result).toEqual(mockInitResult)
      expect(mockConfigRepository.save).not.toHaveBeenCalled()
    })

    test('should add new vault to recent vaults', async () => {
      const mockVault: VaultConfig = {
        path: '/test/new-vault',
        name: 'New Vault',
        createdAt: '2024-01-03T00:00:00.000Z',
        lastAccessed: '2024-01-03T12:00:00.000Z'
      }

      mockInitializerService.initialize.mockResolvedValue({
        success: true,
        vault: mockVault
      })
      await service.initialize()

      await service.setCurrentVault('/test/new-vault')

      expect(mockVaultSelectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          recentVaults: expect.arrayContaining([
            expect.objectContaining({ path: '/test/new-vault' })
          ])
        })
      )
    })

    test('should update existing vault in recent vaults', async () => {
      const updatedVault: VaultConfig = {
        path: '/test/vault1',
        name: 'Updated Vault 1',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastAccessed: '2024-01-03T12:00:00.000Z'
      }

      mockInitializerService.initialize.mockResolvedValue({
        success: true,
        vault: updatedVault
      })
      await service.initialize()

      await service.setCurrentVault('/test/vault1')

      expect(mockVaultSelectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          recentVaults: expect.arrayContaining([
            expect.objectContaining({
              path: '/test/vault1',
              name: 'Updated Vault 1'
            })
          ])
        })
      )
    })

    test('should limit recent vaults to 10 items', async () => {
      // 10개의 recent vault으로 초기화
      const manyVaults: VaultConfig[] = Array.from({ length: 10 }, (_, i) => ({
        path: `/test/vault${i}`,
        name: `Vault ${i}`,
        createdAt: '2024-01-01T00:00:00.000Z',
        lastAccessed: '2024-01-01T12:00:00.000Z'
      }))
      mockAppConfig.recentVaults = manyVaults

      const newVault: VaultConfig = {
        path: '/test/vault-new',
        name: 'New Vault',
        createdAt: '2024-01-03T00:00:00.000Z',
        lastAccessed: '2024-01-03T12:00:00.000Z'
      }

      mockInitializerService.initialize.mockResolvedValue({
        success: true,
        vault: newVault
      })
      await service.initialize()

      await service.setCurrentVault('/test/vault-new')

      expect(mockVaultSelectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          recentVaults: expect.arrayContaining([
            expect.objectContaining({ path: '/test/vault-new' })
          ])
        })
      )

      const savedConfig = mockVaultSelectionRepo.save.mock.calls[0][0]
      expect(savedConfig.recentVaults).toHaveLength(10)
      expect(savedConfig.recentVaults[0]).toEqual(newVault)
    })
  })

  describe('getRecentVaults', () => {
    test('should return copy of recent vaults', async () => {
      await service.initialize()

      const result = await service.getRecentVaults()

      expect(result).toEqual(mockAppConfig.recentVaults)
      expect(result).not.toBe(mockAppConfig.recentVaults) // 복사본인지 확인
    })
  })

  describe('removeFromRecent', () => {
    test('should remove vault from recent list', async () => {
      await service.initialize()

      await service.removeFromRecent('/test/vault2')

      expect(mockVaultSelectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          recentVaults: expect.not.arrayContaining([
            expect.objectContaining({ path: '/test/vault2' })
          ])
        })
      )
    })

    test('should clear current vault if removed', async () => {
      await service.initialize()

      await service.removeFromRecent('/test/vault1')

      expect(mockVaultSelectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentVault: undefined
        })
      )
    })

    test('should not affect current vault if different vault removed', async () => {
      await service.initialize()

      await service.removeFromRecent('/test/vault2')

      expect(mockVaultSelectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          currentVault: '/test/vault1'
        })
      )
    })
  })

  describe('vault selector settings', () => {
    test('should show selector when configured to show but has current vault', async () => {
      mockAppConfig.showVaultSelector = true
      mockAppConfig.currentVault = '/test/vault1'
      await service.initialize()

      expect(service.shouldShowSelector()).toBe(false)
    })

    test('should show selector when no current vault', async () => {
      mockAppConfig.showVaultSelector = true
      mockAppConfig.currentVault = undefined
      await service.initialize()

      expect(service.shouldShowSelector()).toBe(true)
    })

    test('should not show selector when configured to hide and has current vault', async () => {
      mockAppConfig.showVaultSelector = false
      mockAppConfig.currentVault = '/test/vault1'
      await service.initialize()

      expect(service.shouldShowSelector()).toBe(false)
    })

    test('should not show selector when configured to hide and no current vault', async () => {
      mockAppConfig.showVaultSelector = false
      mockAppConfig.currentVault = undefined
      await service.initialize()

      expect(service.shouldShowSelector()).toBe(false)
    })

    test('should update show selector setting', async () => {
      await service.initialize()

      await service.setShowSelector(false)

      expect(mockVaultSelectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          showVaultSelector: false
        })
      )
    })
  })
})
