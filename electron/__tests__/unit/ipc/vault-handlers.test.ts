import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'

// electron 모킹
jest.mock('electron', () => ({
  BrowserWindow: class MockBrowserWindow {
    id = Math.floor(Math.random() * 1000)
  },
  app: {
    getPath: jest.fn(() => '/tmp/test-app-data')
  },
  dialog: {},
  ipcMain: {
    handle: jest.fn(),
    removeHandler: jest.fn()
  },
  globalShortcut: {}
}))

// vault 모듈 모킹
jest.mock('../../../main/vault', () => ({
  getVaultManager: jest.fn()
}))

import { BrowserWindow } from 'electron'
import { createVaultHandlers } from '../../../main/ipc/handlers/vault-handlers'
import { IPCContext } from '../../../main/ipc/types'
import { VaultConfig, VaultInitResult } from '../../../main/vault/interfaces'
import { getVaultManager } from '../../../main/vault'

const mockGetVaultManager = getVaultManager as jest.MockedFunction<typeof getVaultManager>

describe('Vault IPC Handlers', () => {
  let mockContext: IPCContext
  let mockVaultManager: any
  let mockWindow: BrowserWindow
  let handlers: ReturnType<typeof createVaultHandlers>

  const mockVaultConfig: VaultConfig = {
    path: '/test/vault',
    name: 'Test Vault',
    createdAt: '2024-01-01T00:00:00.000Z',
    lastAccessed: '2024-01-01T12:00:00.000Z'
  }

  const mockRecentVaults: VaultConfig[] = [
    mockVaultConfig,
    {
      path: '/test/vault2',
      name: 'Test Vault 2',
      createdAt: '2024-01-02T00:00:00.000Z',
      lastAccessed: '2024-01-02T12:00:00.000Z'
    }
  ]

  beforeEach(() => {
    mockWindow = new BrowserWindow()
    
    mockContext = {
      mainWindow: mockWindow
    }

    // Mock VaultManager
    mockVaultManager = {
      getCurrentVault: jest.fn().mockResolvedValue(mockVaultConfig),
      setCurrentVault: jest.fn().mockResolvedValue({ success: true, vault: mockVaultConfig }),
      getRecentVaults: jest.fn().mockResolvedValue(mockRecentVaults),
      removeVaultFromRecent: jest.fn().mockResolvedValue(undefined),
      shouldShowVaultSelector: jest.fn().mockReturnValue(true),
      setShowVaultSelector: jest.fn().mockResolvedValue(undefined),
      showVaultSelectionDialog: jest.fn().mockResolvedValue('/selected/vault/path')
    }

    mockGetVaultManager.mockReturnValue(mockVaultManager)

    handlers = createVaultHandlers(mockContext)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('vault:get-current handler', () => {
    test('should return current vault', async () => {
      const handler = handlers.find(h => h.channel === 'vault:get-current')
      expect(handler).toBeDefined()

      const result = await handler!.handler()

      expect(mockVaultManager.getCurrentVault).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockVaultConfig)
    })

    test('should return null when no current vault', async () => {
      mockVaultManager.getCurrentVault.mockResolvedValue(null)
      const handler = handlers.find(h => h.channel === 'vault:get-current')

      const result = await handler!.handler(mockContext)

      expect(result).toBeNull()
    })

    test('should handle getCurrentVault error', async () => {
      const error = new Error('Failed to get current vault')
      mockVaultManager.getCurrentVault.mockRejectedValue(error)
      const handler = handlers.find(h => h.channel === 'vault:get-current')

      await expect(handler!.handler()).rejects.toThrow('Failed to get current vault')
    })
  })

  describe('vault:get-recent handler', () => {
    test('should return recent vaults', async () => {
      const handler = handlers.find(h => h.channel === 'vault:get-recent')
      expect(handler).toBeDefined()

      const result = await handler!.handler(mockContext)

      expect(mockVaultManager.getRecentVaults).toHaveBeenCalledTimes(1)
      expect(result).toEqual(mockRecentVaults)
    })

    test('should return empty array when no recent vaults', async () => {
      mockVaultManager.getRecentVaults.mockResolvedValue([])
      const handler = handlers.find(h => h.channel === 'vault:get-recent')

      const result = await handler!.handler(mockContext)

      expect(result).toEqual([])
    })
  })

  describe('vault:select handler', () => {
    test('should show selection dialog and return selected path', async () => {
      const handler = handlers.find(h => h.channel === 'vault:select')
      expect(handler).toBeDefined()

      const result = await handler!.handler(mockContext)

      expect(mockVaultManager.showVaultSelectionDialog).toHaveBeenCalledWith(mockWindow)
      expect(result).toBe('/selected/vault/path')
    })

    test('should handle dialog cancellation', async () => {
      mockVaultManager.showVaultSelectionDialog.mockResolvedValue(null)
      const handler = handlers.find(h => h.channel === 'vault:select')

      const result = await handler!.handler(mockContext)

      expect(result).toBeNull()
    })

    test('should handle dialog error', async () => {
      const error = new Error('Dialog failed')
      mockVaultManager.showVaultSelectionDialog.mockRejectedValue(error)
      const handler = handlers.find(h => h.channel === 'vault:select')

      await expect(handler!.handler(mockContext)).rejects.toThrow('Dialog failed')
    })
  })

  describe('vault:set-current handler', () => {
    test('should set current vault successfully', async () => {
      const handler = handlers.find(h => h.channel === 'vault:set-current')
      expect(handler).toBeDefined()

      const mockEvent = { sender: { id: 1 } }
      const vaultPath = '/test/new-vault'

      const result = await handler!.handler(mockEvent, vaultPath)

      expect(mockVaultManager.setCurrentVault).toHaveBeenCalledWith(vaultPath)
      expect(result).toEqual({ success: true, vault: mockVaultConfig })
    })

    test('should handle vault initialization failure', async () => {
      const failureResult: VaultInitResult = {
        success: false,
        error: 'Invalid vault path'
      }
      mockVaultManager.setCurrentVault.mockResolvedValue(failureResult)
      const handler = handlers.find(h => h.channel === 'vault:set-current')

      const mockEvent = { sender: { id: 1 } }
      const result = await handler!.handler(mockEvent, '/invalid/path')

      expect(result).toEqual(failureResult)
    })

    test('should validate vault path parameter', async () => {
      const handler = handlers.find(h => h.channel === 'vault:set-current')
      const mockEvent = { sender: { id: 1 } }

      // undefined path should be handled gracefully
      await handler!.handler(mockEvent, undefined)
      expect(mockVaultManager.setCurrentVault).toHaveBeenCalledWith(undefined)
    })
  })

  describe('vault:remove-recent handler', () => {
    test('should remove vault from recent list', async () => {
      const handler = handlers.find(h => h.channel === 'vault:remove-recent')
      expect(handler).toBeDefined()

      const mockEvent = { sender: { id: 1 } }
      const vaultPath = '/test/vault'

      await handler!.handler(mockEvent, vaultPath)

      expect(mockVaultManager.removeVaultFromRecent).toHaveBeenCalledWith(vaultPath)
    })

    test('should handle removal error', async () => {
      const error = new Error('Failed to remove vault')
      mockVaultManager.removeVaultFromRecent.mockRejectedValue(error)
      const handler = handlers.find(h => h.channel === 'vault:remove-recent')

      const mockEvent = { sender: { id: 1 } }
      await expect(handler!.handler(mockEvent, '/test/vault')).rejects.toThrow('Failed to remove vault')
    })
  })

  describe('vault:should-show-selector handler', () => {
    test('should return selector visibility state', async () => {
      const handler = handlers.find(h => h.channel === 'vault:should-show-selector')
      expect(handler).toBeDefined()

      const result = await handler!.handler(mockContext)

      expect(mockVaultManager.shouldShowVaultSelector).toHaveBeenCalledTimes(1)
      expect(result).toBe(true)
    })

    test('should return false when selector should be hidden', async () => {
      mockVaultManager.shouldShowVaultSelector.mockReturnValue(false)
      const handler = handlers.find(h => h.channel === 'vault:should-show-selector')

      const result = await handler!.handler(mockContext)

      expect(result).toBe(false)
    })
  })

  describe('vault:set-show-selector handler', () => {
    test('should set selector visibility', async () => {
      const handler = handlers.find(h => h.channel === 'vault:set-show-selector')
      expect(handler).toBeDefined()

      const mockEvent = { sender: { id: 1 } }
      await handler!.handler(mockEvent, false)

      expect(mockVaultManager.setShowVaultSelector).toHaveBeenCalledWith(false)
    })

    test('should handle boolean parameter correctly', async () => {
      const handler = handlers.find(h => h.channel === 'vault:set-show-selector')
      const mockEvent = { sender: { id: 1 } }

      await handler!.handler(mockEvent, true)
      expect(mockVaultManager.setShowVaultSelector).toHaveBeenCalledWith(true)

      await handler!.handler(mockEvent, false)
      expect(mockVaultManager.setShowVaultSelector).toHaveBeenCalledWith(false)
    })
  })

  describe('handler structure', () => {
    test('should have correct number of handlers', () => {
      expect(handlers).toHaveLength(7)
    })

    test('should have all required handler properties', () => {
      handlers.forEach(handler => {
        expect(handler).toHaveProperty('channel')
        expect(handler).toHaveProperty('handler')
        expect(typeof handler.channel).toBe('string')
        expect(typeof handler.handler).toBe('function')
      })
    })

    test('should have unique channel names', () => {
      const channels = handlers.map(h => h.channel)
      const uniqueChannels = new Set(channels)
      expect(uniqueChannels.size).toBe(channels.length)
    })

    test('should have proper vault channel prefixes', () => {
      handlers.forEach(handler => {
        expect(handler.channel).toMatch(/^vault:/)
      })
    })
  })

  describe('integration scenarios', () => {
    test('should handle complete vault selection workflow', async () => {
      // 1. Get current vault (none)
      mockVaultManager.getCurrentVault.mockResolvedValueOnce(null)
      const getCurrentHandler = handlers.find(h => h.channel === 'vault:get-current')
      let result = await getCurrentHandler!.handler(mockContext)
      expect(result).toBeNull()

      // 2. Show selector
      const shouldShowHandler = handlers.find(h => h.channel === 'vault:should-show-selector')
      result = await shouldShowHandler!.handler(mockContext)
      expect(result).toBe(true)

      // 3. Select vault
      const selectHandler = handlers.find(h => h.channel === 'vault:select')
      result = await selectHandler!.handler(mockContext)
      expect(result).toBe('/selected/vault/path')

      // 4. Set current vault
      const setCurrentHandler = handlers.find(h => h.channel === 'vault:set-current')
      const mockEvent = { sender: { id: 1 } }
      result = await setCurrentHandler!.handler(mockEvent, '/selected/vault/path')
      expect(result).toEqual({ success: true, vault: mockVaultConfig })
    })

    test('should handle recent vaults management workflow', async () => {
      // 1. Get recent vaults
      const getRecentHandler = handlers.find(h => h.channel === 'vault:get-recent')
      let result = await getRecentHandler!.handler(mockContext)
      expect(result).toEqual(mockRecentVaults)

      // 2. Remove from recent
      const removeHandler = handlers.find(h => h.channel === 'vault:remove-recent')
      const mockEvent = { sender: { id: 1 } }
      await removeHandler!.handler(mockEvent, '/test/vault2')
      expect(mockVaultManager.removeVaultFromRecent).toHaveBeenCalledWith('/test/vault2')

      // 3. Verify removal (mock would return updated list)
      mockVaultManager.getRecentVaults.mockResolvedValueOnce([mockVaultConfig])
      result = await getRecentHandler!.handler()
      expect(result).toEqual([mockVaultConfig])
    })
  })
})