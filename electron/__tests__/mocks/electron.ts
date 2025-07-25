import { jest } from '@jest/globals'

// Mock fs for electron
const _mockFs = {
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn()
}

// Mock BrowserWindow
export class BrowserWindow {
  static getAllWindows = jest.fn(() => [])

  webContents = {
    send: jest.fn(),
    openDevTools: jest.fn(),
    executeJavaScript: jest.fn()
  }

  loadURL = jest.fn()
  loadFile = jest.fn()
  show = jest.fn()
  hide = jest.fn()
  close = jest.fn()
  on = jest.fn()
  once = jest.fn()
  isVisible = jest.fn().mockReturnValue(true)
  isFocused = jest.fn().mockReturnValue(false)
  isMinimized = jest.fn().mockReturnValue(false)
  isDestroyed = jest.fn().mockReturnValue(false)
  focus = jest.fn()
  restore = jest.fn()
  setPosition = jest.fn()
  setBounds = jest.fn()
  getBounds = jest.fn().mockReturnValue({ x: 0, y: 0, width: 800, height: 600 })
  setVisibleOnAllWorkspaces = jest.fn()
  id = 1

  constructor(_options?: any) {
    // Mock constructor
  }
}

// Mock app
export const app = {
  getPath: jest.fn((name: string) => {
    switch (name) {
      case 'userData':
        return '/tmp/not-e-test/userData'
      case 'documents':
        return '/tmp/not-e-test/documents'
      default:
        return '/tmp/not-e-test'
    }
  }),
  getVersion: jest.fn(() => '1.0.0'),
  whenReady: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn(),
  on: jest.fn()
}

// Mock dialog
export const dialog = {
  showOpenDialog: jest.fn().mockResolvedValue({
    canceled: false,
    filePaths: ['/tmp/not-e-test/selected-vault']
  }),
  showSaveDialog: jest.fn(),
  showMessageBox: jest.fn()
}

// Mock ipcMain
export const ipcMain = {
  handle: jest.fn(),
  removeHandler: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn()
}

// Mock globalShortcut
export const globalShortcut = {
  register: jest.fn().mockReturnValue(true),
  unregister: jest.fn(),
  unregisterAll: jest.fn(),
  isRegistered: jest.fn().mockReturnValue(false)
}

// Mock shell
export const shell = {
  openExternal: jest.fn(),
  showItemInFolder: jest.fn()
}

// Mock screen
export const screen = {
  getCursorScreenPoint: jest.fn().mockReturnValue({ x: 100, y: 100 }),
  getDisplayNearestPoint: jest.fn().mockReturnValue({
    workArea: { x: 0, y: 0, width: 1920, height: 1080 }
  })
}
