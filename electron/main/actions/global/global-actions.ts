import { BrowserWindow } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../shortcuts/types/shortcut-types'
import { findTargetWindow, centerWindowOnCurrentDisplay, showWindowAsSidebar } from './window-utils'
import { getWindowMode, getToggleSettings } from './toggle-mode-manager'

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
      name: 'toggle-window-sidebar',
      description: 'Show/hide window as sidebar',
      category: ShortcutCategory.GLOBAL,
      handler: async (window: BrowserWindow | null): Promise<void> => {
        const windowMode = await getWindowMode()
        if (windowMode !== 'toggle') {
          console.log('Toggle disabled in normal mode')
          return
        }

        const toggleSettings = await getToggleSettings()
        const targetWindow = findTargetWindow(window)

        if (targetWindow) {
          if (targetWindow.isVisible() && targetWindow.isFocused()) {
            targetWindow.hide()
          } else {
            showWindowAsSidebar(
              targetWindow,
              toggleSettings.sidebarPosition || 'right',
              toggleSettings.sidebarWidth || 400
            )
          }
        }
      }
    },
    {
      name: 'toggle-window-standard',
      description: 'Show/hide window (standard behavior)',
      category: ShortcutCategory.GLOBAL,
      handler: async (window: BrowserWindow | null): Promise<void> => {
        const windowMode = await getWindowMode()
        if (windowMode !== 'toggle') {
          console.log('Toggle disabled in normal mode')
          return
        }

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
    }
  ]
}
