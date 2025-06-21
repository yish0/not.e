import { BrowserWindow } from 'electron'
import { ShortcutAction } from '../shortcuts/types'

export function createGlobalActions(): ShortcutAction[] {
  return [
    {
      name: 'quick-note',
      description: 'Quick note (global)',
      category: 'global',
      handler: (window: BrowserWindow | null): void => {
        // 전역 단축키의 경우 window가 null일 수 있으므로 메인 윈도우를 찾아서 활성화
        let targetWindow = window
        
        if (!targetWindow) {
          // BrowserWindow.getAllWindows()로 활성 윈도우 찾기
          const allWindows = BrowserWindow.getAllWindows()
          targetWindow = allWindows.find(w => !w.isDestroyed()) || null
        }
        
        if (targetWindow) {
          if (targetWindow.isMinimized()) targetWindow.restore()
          targetWindow.focus()
          targetWindow.webContents.send('shortcut:quick-note')
        }
      }
    }
  ]
}