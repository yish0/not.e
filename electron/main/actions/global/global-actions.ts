import { BrowserWindow, screen } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types'
import { ShortcutCategory } from '../../shortcuts/types'

// 헬퍼 함수들
function findTargetWindow(window: BrowserWindow | null): BrowserWindow | null {
  if (window && !window.isDestroyed()) return window
  
  const allWindows = BrowserWindow.getAllWindows()
  return allWindows.find((w) => !w.isDestroyed()) || null
}

function centerWindowOnCurrentDisplay(window: BrowserWindow): void {
  const cursorPoint = screen.getCursorScreenPoint()
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint)
  const { workArea } = currentDisplay
  const windowBounds = window.getBounds()
  
  const centerX = workArea.x + Math.floor((workArea.width - windowBounds.width) / 2)
  const centerY = workArea.y + Math.floor((workArea.height - windowBounds.height) / 2)
  
  window.setPosition(centerX, centerY)
}

function showWindow(window: BrowserWindow): void {
  if (window.isMinimized()) window.restore()
  centerWindowOnCurrentDisplay(window)
  window.show()
  window.focus()
}

function toggleWindowVisibility(window: BrowserWindow): void {
  if (window.isVisible() && window.isFocused()) {
    window.hide()
  } else {
    showWindow(window)
  }
}

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
