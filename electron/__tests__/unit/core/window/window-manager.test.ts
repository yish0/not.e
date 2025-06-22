import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'

// Mock electron before importing modules
jest.mock('electron', () => ({
  BrowserWindow: jest.fn().mockImplementation(() => ({
    once: jest.fn(),
    on: jest.fn(),
    loadURL: jest.fn(),
    loadFile: jest.fn(),
    webContents: {
      openDevTools: jest.fn()
    },
    show: jest.fn(),
    isDestroyed: jest.fn(() => false)
  })),
  app: {
    getPath: jest.fn(() => '/tmp/test-app-data')
  }
}))

// Mock config
jest.mock('../../../../config', () => ({
  isDev: false,
  APP_ROOT: '/test/app/root'
}))

import { BrowserWindow } from 'electron'
import {
  DefaultWindowManager,
  getWindowManager,
  resetWindowManager
} from '../../../../main/core/window/window-manager'

const MockBrowserWindow = BrowserWindow as jest.MockedClass<typeof BrowserWindow>

describe('DefaultWindowManager', () => {
  let windowManager: DefaultWindowManager
  let mockWindow: jest.Mocked<BrowserWindow>

  beforeEach(() => {
    // Setup mock window
    mockWindow = {
      once: jest.fn(),
      on: jest.fn(),
      loadURL: jest.fn(),
      loadFile: jest.fn(),
      webContents: {
        openDevTools: jest.fn()
      },
      show: jest.fn(),
      isDestroyed: jest.fn(() => false)
    } as any

    MockBrowserWindow.mockImplementation(() => mockWindow)

    windowManager = new DefaultWindowManager()
  })

  afterEach(() => {
    jest.clearAllMocks()
    resetWindowManager()
  })

  describe('createMainWindow', () => {
    test('should create window with default configuration', () => {
      const window = windowManager.createMainWindow()

      expect(MockBrowserWindow).toHaveBeenCalledWith({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: expect.stringMatching(/preload\.js$/)
        },
        titleBarStyle: 'hiddenInset',
        show: false
      })

      expect(window).toBe(mockWindow)
    })

    test('should create window with custom configuration', () => {
      const config = {
        width: 1000,
        height: 600,
        minWidth: 500,
        minHeight: 400,
        show: true
      }

      windowManager.createMainWindow(config)

      expect(MockBrowserWindow).toHaveBeenCalledWith({
        width: 1000,
        height: 600,
        minWidth: 500,
        minHeight: 400,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: expect.stringMatching(/preload\.js$/)
        },
        titleBarStyle: 'hiddenInset',
        show: true
      })
    })

    test('should setup window events', () => {
      windowManager.createMainWindow()

      expect(mockWindow.once).toHaveBeenCalledWith('ready-to-show', expect.any(Function))
      expect(mockWindow.on).toHaveBeenCalledWith('closed', expect.any(Function))
    })

    test('should load production content when not in dev mode', () => {
      windowManager.createMainWindow()

      expect(mockWindow.loadFile).toHaveBeenCalledWith('/test/app/root/build/index.html')
      expect(mockWindow.loadURL).not.toHaveBeenCalled()
    })
  })

  describe('window events', () => {
    test('should handle ready-to-show event', () => {
      windowManager.createMainWindow()

      // Get the ready-to-show handler
      const readyHandler = (mockWindow.once as jest.Mock).mock.calls.find(
        (call) => call[0] === 'ready-to-show'
      )[1]

      readyHandler()

      expect(mockWindow.show).toHaveBeenCalled()
    })

    test('should handle closed event', () => {
      windowManager.createMainWindow()

      // Get the closed handler
      const closedHandler = (mockWindow.on as jest.Mock).mock.calls.find(
        (call) => call[0] === 'closed'
      )[1]

      closedHandler()

      expect(windowManager.getMainWindow()).toBeNull()
    })
  })
})

describe('getWindowManager', () => {
  afterEach(() => {
    resetWindowManager()
  })

  test('should return singleton instance', () => {
    const manager1 = getWindowManager()
    const manager2 = getWindowManager()

    expect(manager1).toBe(manager2)
    expect(manager1).toBeInstanceOf(DefaultWindowManager)
  })

  test('should create new instance after reset', () => {
    const manager1 = getWindowManager()
    resetWindowManager()
    const manager2 = getWindowManager()

    expect(manager1).not.toBe(manager2)
  })
})
