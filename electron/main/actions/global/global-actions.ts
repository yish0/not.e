import { BrowserWindow, screen } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types'
import { ShortcutCategory } from '../../shortcuts/types'

export function createGlobalActions(): ShortcutAction[] {
  return [
    {
      name: 'quick-note',
      description: 'Quick note (global)',
      category: ShortcutCategory.GLOBAL,
      handler: (window: BrowserWindow | null): void => {
        // 전역 단축키의 경우 window가 null일 수 있으므로 메인 윈도우를 찾아서 활성화
        let targetWindow = window

        if (!targetWindow) {
          // BrowserWindow.getAllWindows()로 활성 윈도우 찾기
          const allWindows = BrowserWindow.getAllWindows()
          targetWindow = allWindows.find((w) => !w.isDestroyed()) || null
        }

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
        console.log('toggle-window action called with window:', window ? window.id : 'null')
        let targetWindow = window

        if (!targetWindow) {
          const allWindows = BrowserWindow.getAllWindows()
          console.log(
            'Found windows:',
            allWindows.map((w) => ({ id: w.id, destroyed: w.isDestroyed() }))
          )
          targetWindow = allWindows.find((w) => !w.isDestroyed()) || null
        }

        if (targetWindow) {
          const isVisible = targetWindow.isVisible()
          const isFocused = targetWindow.isFocused()
          const isMinimized = targetWindow.isMinimized()

          console.log('Window state:', { id: targetWindow.id, isVisible, isFocused, isMinimized })

          if (isVisible && isFocused) {
            console.log('Hiding window')
            targetWindow.hide()
          } else {
            console.log('Showing and focusing window on current desktop')

            // 먼저 윈도우를 복원 (필요한 경우)
            if (isMinimized) targetWindow.restore()

            // 현재 마우스 커서가 있는 디스플레이로 윈도우 이동
            const { x, y } = screen.getCursorScreenPoint()
            console.log('Cursor position:', { x, y })

            // 커서가 있는 디스플레이 찾기
            const currentDisplay = screen.getDisplayNearestPoint({ x, y })
            console.log('Target display:', {
              id: currentDisplay.id,
              bounds: currentDisplay.bounds,
              workArea: currentDisplay.workArea
            })

            // 윈도우를 해당 디스플레이의 작업 영역으로 이동
            const { workArea } = currentDisplay
            const windowBounds = targetWindow.getBounds()

            // 윈도우를 디스플레이 중앙에 배치
            const centerX = workArea.x + Math.floor((workArea.width - windowBounds.width) / 2)
            const centerY = workArea.y + Math.floor((workArea.height - windowBounds.height) / 2)

            console.log('Moving window to:', { centerX, centerY })
            targetWindow.setPosition(centerX, centerY)

            // 윈도우 표시 및 포커스
            targetWindow.show()
            targetWindow.focus()
          }
        } else {
          console.log('No target window found')
        }
      }
    }
  ]
}
