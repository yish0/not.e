import type { ShortcutConfig } from '../types/shortcut-types'
import { ShortcutCategory } from '../types/shortcut-types'
import type { ToggleSettings } from '../../vault/types/vault-types'

// 일반 모드에서는 토글 기능이 비활성화된 단축키
export const NORMAL_MODE_GLOBAL_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'CmdOrCtrl+Shift+N',
    action: 'quick-note',
    description: 'Quick note (global)',
    category: ShortcutCategory.GLOBAL
  }
  // 토글 관련 단축키는 제거됨
]

/**
 * 윈도우 모드와 토글 설정에 따라 동적으로 글로벌 단축키를 생성합니다
 */
export function generateGlobalShortcuts(
  windowMode: 'normal' | 'toggle',
  toggleSettings?: ToggleSettings
): ShortcutConfig[] {
  const baseShortcuts: ShortcutConfig[] = [
    {
      key: 'CmdOrCtrl+Shift+N',
      action: 'quick-note',
      description: 'Quick note (global)',
      category: ShortcutCategory.GLOBAL
    }
  ]

  // 일반 모드에서는 기본 단축키만 사용
  if (windowMode === 'normal') {
    return baseShortcuts
  }

  // 토글 모드에서는 토글 설정에 따라 적절한 액션 할당
  if (windowMode === 'toggle' && toggleSettings) {
    const toggleAction = toggleSettings.toggleType === 'sidebar'
      ? 'toggle-window-sidebar'
      : 'toggle-window-standard'
    
    const toggleDescription = toggleSettings.toggleType === 'sidebar'
      ? 'Show/hide window as sidebar'
      : 'Show/hide window (standard behavior)'

    baseShortcuts.push({
      key: 'CmdOrCtrl+Shift+T',
      action: toggleAction,
      description: toggleDescription,
      category: ShortcutCategory.GLOBAL
    })
  }

  return baseShortcuts
}

// Legacy exports for backward compatibility
export const DEFAULT_GLOBAL_SHORTCUTS: ShortcutConfig[] = NORMAL_MODE_GLOBAL_SHORTCUTS

// @deprecated Use generateGlobalShortcuts instead
export const CROSS_DESKTOP_GLOBAL_SHORTCUTS: ShortcutConfig[] = [
  {
    key: 'CmdOrCtrl+Shift+N',
    action: 'quick-note',
    description: 'Quick note (global)',
    category: ShortcutCategory.GLOBAL
  },
  {
    key: 'CmdOrCtrl+Shift+T',
    action: 'toggle-window-standard',
    description: 'Show/hide window (standard behavior)',
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
