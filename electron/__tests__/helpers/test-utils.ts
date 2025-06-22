import { jest } from '@jest/globals'
import { BrowserWindow } from 'electron'

/**
 * Creates a mock BrowserWindow with common methods
 */
export function createMockBrowserWindow(): jest.Mocked<BrowserWindow> {
  return {
    id: Math.floor(Math.random() * 1000),
    once: jest.fn(),
    on: jest.fn(),
    loadURL: jest.fn(),
    loadFile: jest.fn(),
    webContents: {
      send: jest.fn(),
      setZoomFactor: jest.fn(),
      getZoomFactor: jest.fn(() => 1.0),
      toggleDevTools: jest.fn(),
      openDevTools: jest.fn()
    },
    show: jest.fn(),
    hide: jest.fn(),
    focus: jest.fn(),
    restore: jest.fn(),
    isMinimized: jest.fn(() => false),
    isVisible: jest.fn(() => true),
    isFocused: jest.fn(() => true),
    isDestroyed: jest.fn(() => false),
    getBounds: jest.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
    setPosition: jest.fn()
  } as any
}

/**
 * Creates a mock IPC event object
 */
export function createMockIPCEvent(senderId: number = 1) {
  return {
    sender: { id: senderId },
    frameId: 1,
    processId: 1,
    senderFrame: {},
    preventDefault: jest.fn(),
    defaultPrevented: false
  }
}

/**
 * Waits for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Creates a temporary test path
 */
export function createTestPath(suffix: string = ''): string {
  return `/tmp/test-not-e${suffix ? `-${suffix}` : ''}-${Date.now()}`
}

/**
 * Mock electron modules with common defaults
 */
export function setupElectronMocks() {
  return {
    BrowserWindow: jest.fn().mockImplementation(() => createMockBrowserWindow()),
    app: {
      getPath: jest.fn(() => '/tmp/test-app-data'),
      on: jest.fn(),
      whenReady: jest.fn(() => Promise.resolve()),
      quit: jest.fn()
    },
    dialog: {
      showOpenDialog: jest.fn(),
      showSaveDialog: jest.fn(),
      showMessageBox: jest.fn()
    },
    ipcMain: {
      handle: jest.fn(),
      removeHandler: jest.fn()
    },
    globalShortcut: {
      register: jest.fn(() => true),
      unregister: jest.fn(() => true),
      unregisterAll: jest.fn(),
      isRegistered: jest.fn(() => false)
    },
    screen: {
      getCursorScreenPoint: jest.fn(() => ({ x: 100, y: 100 })),
      getDisplayNearestPoint: jest.fn(() => ({
        id: 1,
        bounds: { x: 0, y: 0, width: 1920, height: 1080 },
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      }))
    }
  }
}
