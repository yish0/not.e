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

import { ipcMain, BrowserWindow } from 'electron'
import { DefaultIPCManager } from '../../../main/ipc/ipc-manager'
import { IPCHandler, IPCContext } from '../../../main/ipc/types'

describe('DefaultIPCManager', () => {
  let ipcManager: DefaultIPCManager
  let mockContext: IPCContext
  let mockWindow: BrowserWindow

  beforeEach(() => {
    mockWindow = new BrowserWindow()
    mockContext = {
      mainWindow: mockWindow
    }

    ipcManager = new DefaultIPCManager()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    test('should create instance with empty channels set', () => {
      expect(ipcManager).toBeDefined()
      expect(ipcManager['registeredChannels']).toBeDefined()
      expect(ipcManager['registeredChannels'].size).toBe(0)
    })
  })

  describe('register method', () => {
    test('should register single handler successfully', () => {
      const handler: IPCHandler = {
        channel: 'test-channel',
        handler: jest.fn().mockResolvedValue('test result')
      }

      ipcManager.register(handler, mockContext)

      expect(ipcMain.handle).toHaveBeenCalledWith('test-channel', expect.any(Function))
      expect(ipcManager['registeredHandlers'].has('test-channel')).toBe(true)
    })

    test('should register multiple handlers', () => {
      const handlers: IPCHandler[] = [
        {
          channel: 'test-channel-1',
          handler: jest.fn().mockResolvedValue('result 1')
        },
        {
          channel: 'test-channel-2',
          handler: jest.fn().mockResolvedValue('result 2')
        }
      ]

      ipcManager.register(handlers, mockContext)

      expect(ipcMain.handle).toHaveBeenCalledTimes(2)
      expect(ipcMain.handle).toHaveBeenCalledWith('test-channel-1', expect.any(Function))
      expect(ipcMain.handle).toHaveBeenCalledWith('test-channel-2', expect.any(Function))
      expect(ipcManager['registeredHandlers'].size).toBe(2)
    })

    test('should prevent duplicate handler registration', () => {
      const handler: IPCHandler = {
        channel: 'duplicate-channel',
        handler: jest.fn()
      }

      // First registration should succeed
      ipcManager.register(handler, mockContext)
      expect(ipcMain.handle).toHaveBeenCalledTimes(1)

      // Second registration should be ignored
      ipcManager.register(handler, mockContext)
      expect(ipcMain.handle).toHaveBeenCalledTimes(1) // Still only called once
      expect(ipcManager['registeredHandlers'].size).toBe(1)
    })

    test('should call handler with correct context and arguments', async () => {
      const mockHandler = jest.fn().mockResolvedValue('test result')
      const handler: IPCHandler = {
        channel: 'context-test',
        handler: mockHandler
      }

      ipcManager.register(handler, mockContext)

      // Get the registered IPC handler function
      const ipcHandlerCall = (ipcMain.handle as jest.Mock).mock.calls[0]
      const registeredFunction = ipcHandlerCall[1]

      // Simulate IPC call
      const mockEvent = { sender: { id: 1 } }
      const testArg1 = 'arg1'
      const testArg2 = { data: 'arg2' }

      const result = await registeredFunction(mockEvent, testArg1, testArg2)

      expect(mockHandler).toHaveBeenCalledWith(mockContext, mockEvent, testArg1, testArg2)
      expect(result).toBe('test result')
    })

    test('should handle handler errors gracefully', async () => {
      const error = new Error('Handler error')
      const mockHandler = jest.fn().mockRejectedValue(error)
      const handler: IPCHandler = {
        channel: 'error-test',
        handler: mockHandler
      }

      ipcManager.register(handler, mockContext)

      const ipcHandlerCall = (ipcMain.handle as jest.Mock).mock.calls[0]
      const registeredFunction = ipcHandlerCall[1]

      const mockEvent = { sender: { id: 1 } }

      await expect(registeredFunction(mockEvent)).rejects.toThrow('Handler error')
    })
  })

  describe('unregister method', () => {
    test('should unregister single channel', () => {
      const handler: IPCHandler = {
        channel: 'test-unregister',
        handler: jest.fn()
      }

      // Register first
      ipcManager.register(handler, mockContext)
      expect(ipcManager['registeredHandlers'].has('test-unregister')).toBe(true)

      // Then unregister
      ipcManager.unregister('test-unregister')

      expect(ipcMain.removeHandler).toHaveBeenCalledWith('test-unregister')
      expect(ipcManager['registeredHandlers'].has('test-unregister')).toBe(false)
    })

    test('should unregister multiple channels', () => {
      const handlers: IPCHandler[] = [
        { channel: 'unregister-1', handler: jest.fn() },
        { channel: 'unregister-2', handler: jest.fn() }
      ]

      // Register first
      ipcManager.register(handlers, mockContext)
      expect(ipcManager['registeredHandlers'].size).toBe(2)

      // Then unregister
      ipcManager.unregister(['unregister-1', 'unregister-2'])

      expect(ipcMain.removeHandler).toHaveBeenCalledTimes(2)
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('unregister-1')
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('unregister-2')
      expect(ipcManager['registeredHandlers'].size).toBe(0)
    })

    test('should handle unregistering non-existent channel gracefully', () => {
      ipcManager.unregister('non-existent-channel')

      expect(ipcMain.removeHandler).toHaveBeenCalledWith('non-existent-channel')
      // Should not throw error
    })
  })

  describe('unregisterAll method', () => {
    test('should unregister all registered handlers', () => {
      const handlers: IPCHandler[] = [
        { channel: 'channel-1', handler: jest.fn() },
        { channel: 'channel-2', handler: jest.fn() },
        { channel: 'channel-3', handler: jest.fn() }
      ]

      // Register multiple handlers
      ipcManager.register(handlers, mockContext)
      expect(ipcManager['registeredHandlers'].size).toBe(3)

      // Unregister all
      ipcManager.unregisterAll()

      expect(ipcMain.removeHandler).toHaveBeenCalledTimes(3)
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('channel-1')
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('channel-2')
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('channel-3')
      expect(ipcManager['registeredHandlers'].size).toBe(0)
    })

    test('should handle empty handlers map', () => {
      ipcManager.unregisterAll()

      expect(ipcMain.removeHandler).not.toHaveBeenCalled()
      expect(ipcManager['registeredHandlers'].size).toBe(0)
    })
  })

  describe('integration scenarios', () => {
    test('should handle complete lifecycle of handler management', () => {
      const handlers: IPCHandler[] = [
        {
          channel: 'lifecycle-1',
          handler: jest.fn().mockResolvedValue('result 1')
        },
        {
          channel: 'lifecycle-2',
          handler: jest.fn().mockResolvedValue('result 2')
        }
      ]

      // Register handlers
      ipcManager.register(handlers, mockContext)
      expect(ipcManager['registeredHandlers'].size).toBe(2)
      expect(ipcMain.handle).toHaveBeenCalledTimes(2)

      // Unregister one handler
      ipcManager.unregister('lifecycle-1')
      expect(ipcManager['registeredHandlers'].size).toBe(1)
      expect(ipcMain.removeHandler).toHaveBeenCalledWith('lifecycle-1')

      // Register new handler
      const newHandler: IPCHandler = {
        channel: 'lifecycle-3',
        handler: jest.fn()
      }
      ipcManager.register(newHandler, mockContext)
      expect(ipcManager['registeredHandlers'].size).toBe(2)

      // Unregister all
      ipcManager.unregisterAll()
      expect(ipcManager['registeredHandlers'].size).toBe(0)
    })

    test('should maintain handler context consistency', async () => {
      const contextTracker = jest.fn()
      const handler: IPCHandler = {
        channel: 'context-consistency',
        handler: async (context) => {
          contextTracker(context)
          return 'success'
        }
      }

      ipcManager.register(handler, mockContext)

      // Simulate multiple IPC calls
      const ipcHandlerCall = (ipcMain.handle as jest.Mock).mock.calls[0]
      const registeredFunction = ipcHandlerCall[1]

      const mockEvent1 = { sender: { id: 1 } }
      const mockEvent2 = { sender: { id: 2 } }

      await registeredFunction(mockEvent1)
      await registeredFunction(mockEvent2)

      // Context should be the same for all calls
      expect(contextTracker).toHaveBeenCalledTimes(2)
      expect(contextTracker).toHaveBeenNthCalledWith(1, mockContext)
      expect(contextTracker).toHaveBeenNthCalledWith(2, mockContext)
    })
  })
})