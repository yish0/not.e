import { BrowserWindow } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../shortcuts/types/shortcut-types'

export function createFileActions(): ShortcutAction[] {
  return [
    {
      name: 'new-note',
      description: 'Create new note',
      category: ShortcutCategory.FILE,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:new-note')
      }
    },
    {
      name: 'open-vault',
      description: 'Open vault',
      category: ShortcutCategory.FILE,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:open-vault')
      }
    },
    {
      name: 'save-note',
      description: 'Save current note',
      category: ShortcutCategory.FILE,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:save-note')
      }
    },
    {
      name: 'save-all',
      description: 'Save all notes',
      category: ShortcutCategory.FILE,
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:save-all')
      }
    }
  ]
}
