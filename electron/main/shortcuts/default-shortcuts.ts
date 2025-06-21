import type { ShortcutConfig } from './types'
import { ShortcutCategory } from './types'

export const DEFAULT_GLOBAL_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'CmdOrCtrl+Shift+N',
    action: 'quick-note',
    description: 'Quick note (global)',
    category: ShortcutCategory.GLOBAL
  },
  {
    key: 'CmdOrCtrl+Shift+T',
    action: 'toggle-window',
    description: 'Show/hide window on current desktop (global)',
    category: ShortcutCategory.GLOBAL
  }
]

export const DEFAULT_LOCAL_SHORTCUTS: ShortcutConfig[] = [
  // 파일 관련
  {
    key: 'CmdOrCtrl+N',
    action: 'new-note',
    description: 'Create new note',
    category: ShortcutCategory.FILE
  },
  {
    key: 'CmdOrCtrl+O',
    action: 'open-vault',
    description: 'Open vault',
    category: ShortcutCategory.FILE
  },
  {
    key: 'CmdOrCtrl+S',
    action: 'save-note',
    description: 'Save current note',
    category: ShortcutCategory.FILE
  },
  {
    key: 'CmdOrCtrl+Shift+S',
    action: 'save-all',
    description: 'Save all notes',
    category: ShortcutCategory.FILE
  },

  // 네비게이션 관련
  {
    key: 'CmdOrCtrl+P',
    action: 'quick-open',
    description: 'Quick open file',
    category: ShortcutCategory.NAVIGATION
  },
  {
    key: 'CmdOrCtrl+Shift+P',
    action: 'command-palette',
    description: 'Open command palette',
    category: ShortcutCategory.NAVIGATION
  },

  // 편집 관련
  {
    key: 'CmdOrCtrl+F',
    action: 'find-in-note',
    description: 'Find in current note',
    category: ShortcutCategory.EDIT
  },
  {
    key: 'CmdOrCtrl+Shift+F',
    action: 'find-in-vault',
    description: 'Find in vault',
    category: ShortcutCategory.EDIT
  },

  // 뷰 관련
  {
    key: 'CmdOrCtrl+B',
    action: 'toggle-sidebar',
    description: 'Toggle sidebar',
    category: ShortcutCategory.VIEW
  },
  {
    key: 'CmdOrCtrl+\\',
    action: 'toggle-preview',
    description: 'Toggle preview',
    category: ShortcutCategory.VIEW
  },
  {
    key: 'CmdOrCtrl+Plus',
    action: 'zoom-in',
    description: 'Zoom in',
    category: ShortcutCategory.VIEW
  },
  {
    key: 'CmdOrCtrl+Minus',
    action: 'zoom-out',
    description: 'Zoom out',
    category: ShortcutCategory.VIEW
  },
  {
    key: 'CmdOrCtrl+0',
    action: 'zoom-reset',
    description: 'Reset zoom',
    category: ShortcutCategory.VIEW
  },

  // 개발자 도구
  {
    key: 'F12',
    action: 'toggle-devtools',
    description: 'Toggle developer tools',
    category: ShortcutCategory.DEV
  },
  {
    key: 'CmdOrCtrl+Shift+I',
    action: 'toggle-devtools',
    description: 'Toggle developer tools',
    category: ShortcutCategory.DEV
  }
]
