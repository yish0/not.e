import { BrowserWindow } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types'
import { ShortcutCategory } from '../../shortcuts/types'

export function createEditActions(): ShortcutAction[] {
  return [
    {
      name: 'find-in-note',
      description: 'Find in current note',
      category: ShortcutCategory.EDIT,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:find-in-note')
      }
    },
    {
      name: 'find-in-vault',
      description: 'Find in vault',
      category: ShortcutCategory.EDIT,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:find-in-vault')
      }
    }
  ]
}
