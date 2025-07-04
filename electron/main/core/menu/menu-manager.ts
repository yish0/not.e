import { Menu } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'
import type { IMenuManager, MenuConfiguration } from './menu-types'
import { DEFAULT_MENU_CONFIGURATION } from './menu-types'
import { MenuTemplate } from './menu-template'

export class MenuManager implements IMenuManager {
  private currentMenu: Menu | null = null
  private isMenuSetFlag = false
  private menuTemplate: MenuTemplate

  constructor() {
    this.menuTemplate = new MenuTemplate()
  }

  /**
   * 액션 배열로부터 메뉴를 생성합니다
   */
  createMenu(actions: ShortcutAction[], config: MenuConfiguration = DEFAULT_MENU_CONFIGURATION): Menu {
    try {
      const template = this.menuTemplate.buildTemplate(actions, config)
      const menu = Menu.buildFromTemplate(template)
      return menu
    } catch (error) {
      console.error('Failed to create menu:', error)
      throw error
    }
  }

  /**
   * 애플리케이션 메뉴를 설정합니다
   */
  setApplicationMenu(menu: Menu | null): void {
    try {
      Menu.setApplicationMenu(menu)
      this.currentMenu = menu
      this.isMenuSetFlag = menu !== null
    } catch (error) {
      console.error('Failed to set application menu:', error)
      this.isMenuSetFlag = false
    }
  }

  /**
   * 메뉴가 설정되어 있는지 확인합니다
   */
  isMenuSet(): boolean {
    return this.isMenuSetFlag
  }

  /**
   * 새로운 액션으로 메뉴를 업데이트합니다
   */
  updateMenu(actions: ShortcutAction[], config: MenuConfiguration = DEFAULT_MENU_CONFIGURATION): void {
    try {
      const menu = this.createMenu(actions, config)
      this.setApplicationMenu(menu)
    } catch (error) {
      console.error('Failed to update menu:', error)
      this.isMenuSetFlag = false
    }
  }

  /**
   * 기본 메뉴로 초기화합니다
   */
  initializeWithDefaultMenu(config: MenuConfiguration = DEFAULT_MENU_CONFIGURATION): void {
    const defaultActions: ShortcutAction[] = []
    this.updateMenu(defaultActions, config)
  }

  /**
   * 주어진 액션들과 함께 메뉴를 초기화합니다
   */
  initializeWithActions(actions: ShortcutAction[], config: MenuConfiguration = DEFAULT_MENU_CONFIGURATION): void {
    this.updateMenu(actions, config)
  }

  /**
   * 메뉴를 정리합니다
   */
  cleanup(): void {
    this.setApplicationMenu(null)
  }
}