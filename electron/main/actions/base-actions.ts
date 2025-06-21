import { BrowserWindow } from 'electron'
import { ShortcutAction } from '../shortcuts/types'

export function createFileActions(): ShortcutAction[] {
  return [
    {
      name: 'new-note',
      description: 'Create new note',
      category: 'file',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:new-note')
      }
    },
    {
      name: 'open-vault',
      description: 'Open vault',
      category: 'file',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:open-vault')
      }
    },
    {
      name: 'save-note',
      description: 'Save current note',
      category: 'file',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:save-note')
      }
    },
    {
      name: 'save-all',
      description: 'Save all notes',
      category: 'file',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:save-all')
      }
    }
  ]
}

export function createNavigationActions(): ShortcutAction[] {
  return [
    {
      name: 'quick-open',
      description: 'Quick open file',
      category: 'navigation',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:quick-open')
      }
    },
    {
      name: 'command-palette',
      description: 'Open command palette',
      category: 'navigation',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:command-palette')
      }
    }
  ]
}

export function createEditActions(): ShortcutAction[] {
  return [
    {
      name: 'find-in-note',
      description: 'Find in current note',
      category: 'edit',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:find-in-note')
      }
    },
    {
      name: 'find-in-vault',
      description: 'Find in vault',
      category: 'edit',
      handler: (window: BrowserWindow | null): void => {
        window?.webContents.send('shortcut:find-in-vault')
      }
    }
  ]
}