import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'

// electron 모킹
jest.mock('electron', () => ({
  BrowserWindow: class MockBrowserWindow {},
  app: {
    getVersion: jest.fn(() => '1.0.0'),
    getPath: jest.fn(() => '/tmp/test-app-data')
  },
  dialog: {},
  ipcMain: {
    handle: jest.fn(),
    removeHandler: jest.fn()
  },
  globalShortcut: {}
}))

import { app } from 'electron'
import { createAppHandlers } from '../../../main/ipc/handlers/app-handlers'

describe('App IPC Handlers', () => {
  let handlers: ReturnType<typeof createAppHandlers>

  beforeEach(() => {
    handlers = createAppHandlers()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('get-app-version handler', () => {
    test('should return app version', async () => {
      const versionHandler = handlers.find((h) => h.channel === 'get-app-version')
      expect(versionHandler).toBeDefined()

      const result = await versionHandler!.handler()

      expect(app.getVersion).toHaveBeenCalledTimes(1)
      expect(result).toBe('1.0.0')
    })

    test('should handle version retrieval error', async () => {
      const error = new Error('Version not available')
      ;(app.getVersion as jest.Mock).mockImplementation(() => {
        throw error
      })

      const versionHandler = handlers.find((h) => h.channel === 'get-app-version')

      expect(() => versionHandler!.handler()).toThrow('Version not available')
    })
  })

  describe('get-platform handler', () => {
    test('should return platform information', async () => {
      const platformHandler = handlers.find((h) => h.channel === 'get-platform')
      expect(platformHandler).toBeDefined()

      const result = await platformHandler!.handler()

      expect(result).toBe(process.platform)
    })

  })

})
