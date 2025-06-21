import { BrowserWindow, screen } from 'electron'

/**
 * 유효한 타겟 윈도우를 찾습니다
 */
export function findTargetWindow(window: BrowserWindow | null): BrowserWindow | null {
  if (window && !window.isDestroyed()) return window
  
  const allWindows = BrowserWindow.getAllWindows()
  return allWindows.find((w) => !w.isDestroyed()) || null
}

/**
 * 윈도우를 현재 커서가 있는 디스플레이의 중앙에 배치합니다
 */
export function centerWindowOnCurrentDisplay(window: BrowserWindow): void {
  const cursorPoint = screen.getCursorScreenPoint()
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint)
  const { workArea } = currentDisplay
  const windowBounds = window.getBounds()
  
  const centerX = workArea.x + Math.floor((workArea.width - windowBounds.width) / 2)
  const centerY = workArea.y + Math.floor((workArea.height - windowBounds.height) / 2)
  
  window.setPosition(centerX, centerY)
}

/**
 * 윈도우를 표시하고 포커스합니다 (필요시 복원 및 위치 조정)
 */
export function showWindow(window: BrowserWindow): void {
  if (window.isMinimized()) window.restore()
  centerWindowOnCurrentDisplay(window)
  window.show()
  window.focus()
}

/**
 * 윈도우의 가시성을 토글합니다
 */
export function toggleWindowVisibility(window: BrowserWindow): void {
  if (window.isVisible() && window.isFocused()) {
    window.hide()
  } else {
    showWindow(window)
  }
}