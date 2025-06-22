import { BrowserWindow } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../shortcuts/types/shortcut-types'

export function createNavigationActions(): ShortcutAction[] {
  return [
    {
      name: 'quick-open',
      description: 'Quick open file',
      category: ShortcutCategory.NAVIGATION,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:quick-open')
      }
    },
    {
      name: 'command-palette',
      description: 'Open command palette',
      category: ShortcutCategory.NAVIGATION,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:command-palette')
      }
    }
  ]
}
