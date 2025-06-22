import { BrowserWindow } from 'electron'
import { join } from 'path'
import { isDev, APP_ROOT } from '../../../config'

export interface WindowConfig {
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  show?: boolean
}

export interface WindowManager {
  createMainWindow(config?: WindowConfig): BrowserWindow
  getMainWindow(): BrowserWindow | null
  setMainWindow(window: BrowserWindow | null): void
}

export class DefaultWindowManager implements WindowManager {
  private mainWindow: BrowserWindow | null = null

  createMainWindow(config: WindowConfig = {}): BrowserWindow {
    const { width = 1200, height = 800, minWidth = 800, minHeight = 600, show = false } = config

    this.mainWindow = new BrowserWindow({
      width,
      height,
      minWidth,
      minHeight,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: join(__dirname, '../../preload/preload.js')
      },
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      show
    })

    this.setupWindowEvents()
    this.loadContent()

    return this.mainWindow
  }

  getMainWindow(): BrowserWindow | null {
    return this.mainWindow
  }

  setMainWindow(window: BrowserWindow | null): void {
    this.mainWindow = window
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show()

      if (isDev) {
        this.mainWindow?.webContents.openDevTools()
      }
    })

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  private loadContent(): void {
    if (!this.mainWindow) return

    if (isDev) {
      this.mainWindow.loadURL('http://localhost:5173')
    } else {
      this.mainWindow.loadFile(join(APP_ROOT, 'build/index.html'))
    }
  }
}

// Singleton instance
let windowManagerInstance: WindowManager | null = null

export function getWindowManager(): WindowManager {
  if (!windowManagerInstance) {
    windowManagerInstance = new DefaultWindowManager()
  }
  return windowManagerInstance
}

export function resetWindowManager(): void {
  windowManagerInstance = null
}
