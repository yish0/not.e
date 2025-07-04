import type { MenuLabelMap, AcceleratorMap } from './menu-types'

/**
 * 액션 이름을 메뉴 라벨로 변환하는 매핑
 */
export const MENU_LABEL_MAP: MenuLabelMap = {
  // File actions
  'new-note': 'New Note',
  'open-vault': 'Open Vault',
  'save-note': 'Save Note',
  'save-all': 'Save All Notes',
  'open-file': 'Open File',
  
  // Edit actions
  'find-in-note': 'Find in Note',
  'find-in-vault': 'Find in Vault',
  
  // View actions
  'toggle-sidebar': 'Toggle Sidebar',
  'toggle-preview': 'Toggle Preview',
  'zoom-in': 'Zoom In',
  'zoom-out': 'Zoom Out',
  'zoom-reset': 'Reset Zoom',
  
  // Navigation actions
  'quick-open': 'Quick Open',
  'command-palette': 'Command Palette',
  
  // Dev actions
  'toggle-devtools': 'Toggle Developer Tools'
}

/**
 * 액션 이름을 가속기로 변환하는 매핑
 */
export const ACCELERATOR_MAP: AcceleratorMap = {
  // File actions
  'new-note': 'CmdOrCtrl+N',
  'open-vault': 'CmdOrCtrl+O',
  'save-note': 'CmdOrCtrl+S',
  'save-all': 'CmdOrCtrl+Shift+S',
  
  // Edit actions
  'find-in-note': 'CmdOrCtrl+F',
  'find-in-vault': 'CmdOrCtrl+Shift+F',
  
  // View actions
  'toggle-sidebar': 'CmdOrCtrl+B',
  'toggle-preview': 'CmdOrCtrl+\\',
  'zoom-in': 'CmdOrCtrl+Plus',
  'zoom-out': 'CmdOrCtrl+-',
  'zoom-reset': 'CmdOrCtrl+0',
  
  // Navigation actions
  'quick-open': 'CmdOrCtrl+P',
  'command-palette': 'CmdOrCtrl+Shift+P',
  
  // Dev actions
  'toggle-devtools': 'F12'
}

/**
 * 액션 이름으로부터 메뉴 라벨을 가져옵니다
 */
export function getMenuLabel(actionName: string): string {
  return MENU_LABEL_MAP[actionName] || actionName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * 액션 이름으로부터 가속기를 가져옵니다
 */
export function getAccelerator(actionName: string): string {
  return ACCELERATOR_MAP[actionName] || ''
}