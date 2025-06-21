import { BrowserWindow } from 'electron'
import { ShortcutAction } from '../shortcuts/types'

export function createViewActions(): ShortcutAction[] {
  return [
    {
      name: 'toggle-sidebar',
      description: 'Toggle sidebar',
      category: 'view',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:toggle-sidebar')
      }
    },
    {
      name: 'toggle-preview',
      description: 'Toggle preview',
      category: 'view',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:toggle-preview')
      }
    },
    {
      name: 'zoom-in',
      description: 'Zoom in',
      category: 'view',
      handler: (window: BrowserWindow | null): void => {
        const webContents = window?.webContents
        if (webContents) {
          const currentZoom = webContents.getZoomFactor()
          webContents.setZoomFactor(Math.min(currentZoom + 0.1, 3.0))
        }
      }
    },
    {
      name: 'zoom-out',
      description: 'Zoom out',
      category: 'view',
      handler: (window: BrowserWindow | null): void => {
        const webContents = window?.webContents
        if (webContents) {
          const currentZoom = webContents.getZoomFactor()
          webContents.setZoomFactor(Math.max(currentZoom - 0.1, 0.3))
        }
      }
    },
    {
      name: 'zoom-reset',
      description: 'Reset zoom',
      category: 'view',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.setZoomFactor(1.0)
      }
    }
  ]
}

export function createDevActions(): ShortcutAction[] {
  return [
    {
      name: 'toggle-devtools',
      description: 'Toggle developer tools',
      category: 'dev',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.toggleDevTools()
      }
    }
  ]
}