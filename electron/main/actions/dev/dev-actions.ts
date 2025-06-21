import { BrowserWindow } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types'
import { ShortcutCategory } from '../../shortcuts/types'

export function createDevActions(): ShortcutAction[] {
  return [
    {
      name: 'toggle-devtools',
      description: 'Toggle developer tools',
      category: ShortcutCategory.DEV,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.toggleDevTools()
      }
    }
  ]
}
