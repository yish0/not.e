import { BrowserWindow } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types'
import { ShortcutCategory } from '../../shortcuts/types'
import { findTargetWindow, toggleWindowVisibility } from './window-utils'

export function createGlobalActions(): ShortcutAction[] {
  return [
    {
      name: 'quick-note',
      description: 'Quick note (global)',
      category: ShortcutCategory.GLOBAL,
      handler: (window: BrowserWindow | null): void => {
        const targetWindow = findTargetWindow(window)
        
        if (targetWindow) {
          if (targetWindow.isMinimized()) targetWindow.restore()
          targetWindow.focus()
          targetWindow.webContents.send('shortcut:quick-note')
        }
      }
    },
    {
      name: 'toggle-window',
      description: 'Show/hide window on current desktop (global)',
      category: ShortcutCategory.GLOBAL,
      handler: (window: BrowserWindow | null): void => {
        const targetWindow = findTargetWindow(window)
        
        if (targetWindow) {
          toggleWindowVisibility(targetWindow)
        }
      }
    }
  ]
}
