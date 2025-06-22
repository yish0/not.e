import { BrowserWindow } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../shortcuts/types/shortcut-types'
import { findTargetWindow, showWindow, centerWindowOnCurrentDisplay } from './window-utils'

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
      description: 'Show/hide window (standard behavior)',
      category: ShortcutCategory.GLOBAL,
      handler: (window: BrowserWindow | null): void => {
        const targetWindow = findTargetWindow(window)
        
        if (targetWindow) {
          if (targetWindow.isVisible() && targetWindow.isFocused()) {
            targetWindow.hide()
          } else {
            if (targetWindow.isMinimized()) targetWindow.restore()
            centerWindowOnCurrentDisplay(targetWindow)
            targetWindow.show()
            targetWindow.focus()
          }
        }
      }
    },
    {
      name: 'toggle-window-cross-desktop',
      description: 'Show/hide window on current desktop (cross-desktop mode)',
      category: ShortcutCategory.GLOBAL,
      handler: async (window: BrowserWindow | null): Promise<void> => {
        const targetWindow = findTargetWindow(window)
        
        if (targetWindow) {
          if (targetWindow.isVisible() && targetWindow.isFocused()) {
            // 크로스 데스크탑 숨김: 모든 워크스페이스에서 보이게 한 후 숨김
            if (process.platform === 'darwin') {
              try {
                targetWindow.setVisibleOnAllWorkspaces(true)
                targetWindow.hide()
              } catch (error) {
                console.warn('Failed to hide from current desktop:', error)
                targetWindow.hide()
              }
            } else {
              targetWindow.hide()
            }
          } else {
            await showWindow(targetWindow)
          }
        }
      }
    }
  ]
}
