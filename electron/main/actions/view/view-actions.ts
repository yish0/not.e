import { BrowserWindow } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../shortcuts/types/shortcut-types'

export function createViewActions(): ShortcutAction[] {
  return [
    {
      name: 'toggle-sidebar',
      description: 'Toggle sidebar',
      category: ShortcutCategory.VIEW,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:toggle-sidebar')
      }
    },
    {
      name: 'toggle-preview',
      description: 'Toggle preview',
      category: ShortcutCategory.VIEW,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:toggle-preview')
      }
    },
    {
      name: 'zoom-in',
      description: 'Zoom in',
      category: ShortcutCategory.VIEW,
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
      category: ShortcutCategory.VIEW,
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
      category: ShortcutCategory.VIEW,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.setZoomFactor(1.0)
      }
    }
  ]
}
