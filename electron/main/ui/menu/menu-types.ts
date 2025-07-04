import type { MenuItemConstructorOptions } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'

/**
 * 메뉴 템플릿 빌더의 인터페이스
 */
export interface MenuTemplateBuilder {
  buildTemplate(actions: ShortcutAction[]): MenuItemConstructorOptions[]
}

/**
 * 메뉴 구성 옵션
 */
export interface MenuConfiguration {
  /** macOS 앱 메뉴 포함 여부 */
  includeAppMenu?: boolean
  /** 기본 편집 메뉴 포함 여부 */
  includeDefaultEditMenu?: boolean
  /** Window 메뉴 포함 여부 */
  includeWindowMenu?: boolean
  /** 개발자 도구 메뉴 포함 여부 */
  includeDevTools?: boolean
}

/**
 * 메뉴 라벨 매핑
 */
export interface MenuLabelMap {
  [actionName: string]: string
}

/**
 * 가속기 매핑
 */
export interface AcceleratorMap {
  [actionName: string]: string
}

/**
 * 메뉴 관리자 인터페이스
 */
export interface IMenuManager {
  createMenu(actions: ShortcutAction[], config?: MenuConfiguration): import('electron').Menu
  setApplicationMenu(menu: import('electron').Menu | null): void
  isMenuSet(): boolean
  updateMenu(actions: ShortcutAction[], config?: MenuConfiguration): void
  initializeWithDefaultMenu(config?: MenuConfiguration): void
  initializeWithActions(actions: ShortcutAction[], config?: MenuConfiguration): void
  cleanup(): void
}

/**
 * 기본 메뉴 구성
 */
export const DEFAULT_MENU_CONFIGURATION: MenuConfiguration = {
  includeAppMenu: process.platform === 'darwin',
  includeDefaultEditMenu: true,
  includeWindowMenu: process.platform === 'darwin',
  includeDevTools: true
}