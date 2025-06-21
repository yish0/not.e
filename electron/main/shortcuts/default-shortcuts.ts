import type { ShortcutConfig } from './types'

export const DEFAULT_GLOBAL_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'CmdOrCtrl+Shift+N',
    action: 'quick-note',
    description: 'Quick note (global)',
    category: 'global'
  },
  {
    key: 'CmdOrCtrl+Shift+T',
    action: 'toggle-window',
    description: 'Show/hide window on current desktop (global)',
    category: 'global'
  }
]

export const DEFAULT_LOCAL_SHORTCUTS: ShortcutConfig[] = [
  // 파일 관련
  {
    key: 'CmdOrCtrl+N',
    action: 'new-note',
    description: 'Create new note',
    category: 'file'
  },
  {
    key: 'CmdOrCtrl+O',
    action: 'open-vault',
    description: 'Open vault',
    category: 'file'
  },
  {
    key: 'CmdOrCtrl+S',
    action: 'save-note',
    description: 'Save current note',
    category: 'file'
  },
  {
    key: 'CmdOrCtrl+Shift+S',
    action: 'save-all',
    description: 'Save all notes',
    category: 'file'
  },

  // 네비게이션 관련
  {
    key: 'CmdOrCtrl+P',
    action: 'quick-open',
    description: 'Quick open file',
    category: 'navigation'
  },
  {
    key: 'CmdOrCtrl+Shift+P',
    action: 'command-palette',
    description: 'Open command palette',
    category: 'navigation'
  },

  // 편집 관련
  {
    key: 'CmdOrCtrl+F',
    action: 'find-in-note',
    description: 'Find in current note',
    category: 'edit'
  },
  {
    key: 'CmdOrCtrl+Shift+F',
    action: 'find-in-vault',
    description: 'Find in vault',
    category: 'edit'
  },

  // 뷰 관련
  {
    key: 'CmdOrCtrl+B',
    action: 'toggle-sidebar',
    description: 'Toggle sidebar',
    category: 'view'
  },
  {
    key: 'CmdOrCtrl+\\',
    action: 'toggle-preview',
    description: 'Toggle preview',
    category: 'view'
  },
  {
    key: 'CmdOrCtrl+Plus',
    action: 'zoom-in',
    description: 'Zoom in',
    category: 'view'
  },
  {
    key: 'CmdOrCtrl+Minus',
    action: 'zoom-out',
    description: 'Zoom out',
    category: 'view'
  },
  {
    key: 'CmdOrCtrl+0',
    action: 'zoom-reset',
    description: 'Reset zoom',
    category: 'view'
  },

  // 개발자 도구
  {
    key: 'F12',
    action: 'toggle-devtools',
    description: 'Toggle developer tools',
    category: 'dev'
  },
  {
    key: 'CmdOrCtrl+Shift+I',
    action: 'toggle-devtools',
    description: 'Toggle developer tools',
    category: 'dev'
  }
]