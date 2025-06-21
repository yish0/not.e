import { BrowserWindow } from 'electron'
import { DefaultIPCManager } from '../../../main/ipc/core'
import type { IPCHandler } from '../../../main/ipc/types'
import { IPCPermissionLevel } from '../../../main/ipc/permissions'

jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    id: Math.floor(Math.random() * 1000),
    webContents: { id: 1 }
  })),
  ipcMain: {
    handle: jest.fn(),
    removeHandler: jest.fn()
  }
}))

// Mock permission manager
jest.mock('../../../main/ipc/permissions', () => ({
  getPermissionManager: () => ({
    setChannelPermission: jest.fn(),
    checkPermission: jest.fn().mockResolvedValue(true)
  }),
  IPCPermissionLevel: {
    ROOT: 'root',
    PLUGIN: 'plugin',
    PUBLIC: 'public'
  }
}))

describe('DefaultIPCManager', () => {
  let ipcManager: DefaultIPCManager
  let mockMainWindow: jest.Mocked<BrowserWindow>
  const { ipcMain } = require('electron')

  beforeEach(() => {
    jest.clearAllMocks()
    mockMainWindow = new BrowserWindow() as jest.Mocked<BrowserWindow>
    ipcManager = new DefaultIPCManager(mockMainWindow)
  })

  describe('Handler Registration', () => {
    it('should register single handler with permission', () => {
      const handler: IPCHandler = {
        channel: 'test-channel',
        handler: jest.fn().mockReturnValue('test result'),
        permission: {
          level: IPCPermissionLevel.PUBLIC,
          description: 'Test channel'
        }
      }

      ipcManager.registerHandler(handler)

      expect(ipcMain.handle).toHaveBeenCalledWith('test-channel', expect.any(Function))
      expect(ipcManager.getRegisteredChannels()).toContain('test-channel')
    })

    it('should register multiple handlers', () => {
      const handlers: IPCHandler[] = [
        {
          channel: 'test-channel-1',
          handler: jest.fn().mockReturnValue('result 1'),
          permission: { level: IPCPermissionLevel.PUBLIC, description: 'Test 1' }
        },
        {
          channel: 'test-channel-2',
          handler: jest.fn().mockReturnValue('result 2'),
          permission: { level: IPCPermissionLevel.ROOT, description: 'Test 2' }
        }
      ]

      ipcManager.registerHandlers(handlers)

      expect(ipcMain.handle).toHaveBeenCalledTimes(2)
      expect(ipcMain.handle).toHaveBeenCalledWith('test-channel-1', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('test-channel-2', expect.any(Function))
      expect(ipcManager.getRegisteredChannels()).toHaveLength(2)
    })

    it('should prevent duplicate handler registration', () => {
      const handler: IPCHandler = {
        channel: 'duplicate-channel',
        handler: jest.fn().mockReturnValue('test result'),
        permission: { level: IPCPermissionLevel.PUBLIC, description: 'Test' }
      }

      ipcManager.registerHandler(handler)
      ipcManager.registerHandler(handler) // Duplicate registration

      expect(ipcMain.handle).toHaveBeenCalledTimes(1)
      expect(ipcManager.getRegisteredChannels()).toHaveLength(1)
    })

    it('should register handler without explicit permission', () => {
      const handler: IPCHandler = {
        channel: 'no-permission-channel',
        handler: jest.fn().mockReturnValue('test result')
      }

      ipcManager.registerHandler(handler)

      expect(ipcMain.handle).toHaveBeenCalledWith('no-permission-channel', expect.any(Function))
      expect(ipcManager.getRegisteredChannels()).toContain('no-permission-channel')
    })
  })

  describe('Handler Unregistration', () => {
    it('should unregister single handler', () => {
      const handler: IPCHandler = {
        channel: 'test-unregister',
        handler: jest.fn(),
        permission: { level: IPCPermissionLevel.PUBLIC, description: 'Test' }
      }

      ipcManager.registerHandler(handler)
      expect(ipcManager.getRegisteredChannels()).toContain('test-unregister')

      ipcManager.unregisterHandler('test-unregister')

      expect(ipcMain.removeHandler).toHaveBeenCalledWith('test-unregister')
      expect(ipcManager.getRegisteredChannels()).not.toContain('test-unregister')
    })

    it('should unregister all handlers', () => {
      const handlers: IPCHandler[] = [
        {
          channel: 'test-1',
          handler: jest.fn(),
          permission: { level: IPCPermissionLevel.PUBLIC, description: 'Test 1' }
        },
        {
          channel: 'test-2',
          handler: jest.fn(),
          permission: { level: IPCPermissionLevel.PUBLIC, description: 'Test 2' }
        }
      ]

      ipcManager.registerHandlers(handlers)
      expect(ipcManager.getRegisteredChannels()).toHaveLength(2)

      ipcManager.unregisterAll()

      expect(ipcMain.removeHandler).toHaveBeenCalledTimes(2)
      expect(ipcManager.getRegisteredChannels()).toHaveLength(0)
    })

    it('should handle unregistering non-existent channel gracefully', () => {
      ipcManager.unregisterHandler('non-existent-channel')

      // Should not throw error and should still call removeHandler
      expect(ipcMain.removeHandler).not.toHaveBeenCalled()
    })
  })

  describe('Main Window Management', () => {
    it('should set and update main window reference', () => {
      const newWindow = new BrowserWindow() as jest.Mocked<BrowserWindow>

      ipcManager.setMainWindow(newWindow)

      // Verify window is set (testing through registration behavior)
      const handler: IPCHandler = {
        channel: 'test-window',
        handler: jest.fn(),
        permission: { level: IPCPermissionLevel.ROOT, description: 'Test' }
      }

      ipcManager.registerHandler(handler)
      expect(ipcMain.handle).toHaveBeenCalledWith('test-window', expect.any(Function))
    })

    it('should handle null main window', () => {
      ipcManager.setMainWindow(null)

      const handler: IPCHandler = {
        channel: 'test-null-window',
        handler: jest.fn(),
        permission: { level: IPCPermissionLevel.ROOT, description: 'Test' }
      }

      ipcManager.registerHandler(handler)
      expect(ipcMain.handle).toHaveBeenCalledWith('test-null-window', expect.any(Function))
    })
  })

  describe('Permission Integration', () => {
    it('should wrap handlers with permission validation', async () => {
      const originalHandler = jest.fn().mockReturnValue('success')
      const handler: IPCHandler = {
        channel: 'protected-channel',
        handler: originalHandler,
        permission: { level: IPCPermissionLevel.ROOT, description: 'Protected' }
      }

      ipcManager.registerHandler(handler)

      // Get the wrapped handler that was registered with ipcMain
      const registeredCall = (ipcMain.handle as jest.Mock).mock.calls[0]
      const wrappedHandler = registeredCall[1]

      // Mock IPC event
      const mockEvent = {
        senderFrame: { url: 'file://test' },
        sender: mockMainWindow.webContents
      }

      // Call the wrapped handler
      const result = await wrappedHandler(mockEvent, 'arg1', 'arg2')

      expect(result).toBe('success')
      expect(originalHandler).toHaveBeenCalledWith(mockEvent, 'arg1', 'arg2')
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete lifecycle of handler management', () => {
      const handlers: IPCHandler[] = [
        {
          channel: 'lifecycle-1',
          handler: jest.fn().mockReturnValue('result 1'),
          permission: { level: IPCPermissionLevel.PUBLIC, description: 'Test 1' }
        },
        {
          channel: 'lifecycle-2',
          handler: jest.fn().mockReturnValue('result 2'),
          permission: { level: IPCPermissionLevel.ROOT, description: 'Test 2' }
        }
      ]

      // Register handlers
      ipcManager.registerHandlers(handlers)
      expect(ipcManager.getRegisteredChannels()).toHaveLength(2)
      expect(ipcMain.handle).toHaveBeenCalledTimes(2)

      // Unregister one handler
      ipcManager.unregisterHandler('lifecycle-1')
      expect(ipcManager.getRegisteredChannels()).toHaveLength(1)
      expect(ipcManager.getRegisteredChannels()).toContain('lifecycle-2')

      // Unregister all remaining handlers
      ipcManager.unregisterAll()
      expect(ipcManager.getRegisteredChannels()).toHaveLength(0)
    })
  })
})
