import type { MenuItemConstructorOptions } from 'electron'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../shortcuts/types/shortcut-types'
import type { MenuTemplateBuilder, MenuConfiguration } from './menu-types'
import { DEFAULT_MENU_CONFIGURATION } from './menu-types'
import { getMenuLabel, getAccelerator } from './menu-config'

export class MenuTemplate implements MenuTemplateBuilder {
  /**
   * 액션들과 구성 옵션으로부터 메뉴 템플릿을 빌드합니다
   */
  buildTemplate(actions: ShortcutAction[], config: MenuConfiguration = DEFAULT_MENU_CONFIGURATION): MenuItemConstructorOptions[] {
    const categorizedActions = this.categorizeActions(actions)
    const template: MenuItemConstructorOptions[] = []

    // macOS 앱 메뉴
    if (config.includeAppMenu) {
      template.push(this.createAppMenu())
    }

    // File 메뉴
    if (categorizedActions.file.length > 0) {
      template.push(this.createFileMenu(categorizedActions.file))
    }

    // Edit 메뉴
    if (config.includeDefaultEditMenu || categorizedActions.edit.length > 0) {
      template.push(this.createEditMenu(categorizedActions.edit, config.includeDefaultEditMenu))
    }

    // View 메뉴
    if (categorizedActions.view.length > 0) {
      template.push(this.createViewMenu(categorizedActions.view))
    }

    // Navigation 메뉴
    if (categorizedActions.navigation.length > 0) {
      template.push(this.createNavigationMenu(categorizedActions.navigation))
    }

    // Window 메뉴
    if (config.includeWindowMenu) {
      template.push(this.createWindowMenu())
    }

    return template
  }

  /**
   * 액션들을 카테고리별로 분류합니다
   */
  private categorizeActions(actions: ShortcutAction[]) {
    return {
      file: actions.filter(action => action.category === ShortcutCategory.FILE),
      edit: actions.filter(action => action.category === ShortcutCategory.EDIT),
      view: actions.filter(action => action.category === ShortcutCategory.VIEW),
      navigation: actions.filter(action => action.category === ShortcutCategory.NAVIGATION),
      dev: actions.filter(action => action.category === ShortcutCategory.DEV),
      global: actions.filter(action => action.category === ShortcutCategory.GLOBAL),
      custom: actions.filter(action => action.category === ShortcutCategory.CUSTOM)
    }
  }

  /**
   * macOS 앱 메뉴를 생성합니다
   */
  private createAppMenu(): MenuItemConstructorOptions {
    return {
      label: 'not.e',
      submenu: [
        { label: 'About not.e', role: 'about' },
        { type: 'separator' },
        { label: 'Services', role: 'services', submenu: [] },
        { type: 'separator' },
        { label: 'Hide not.e', accelerator: 'Command+H', role: 'hide' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideothers' },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        { label: 'Quit not.e', accelerator: 'Command+Q', role: 'quit' }
      ]
    }
  }

  /**
   * File 메뉴를 생성합니다
   */
  private createFileMenu(fileActions: ShortcutAction[]): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = []
    
    fileActions.forEach(action => {
      submenu.push({
        label: getMenuLabel(action.name),
        accelerator: getAccelerator(action.name),
        click: () => action.handler(null)
      })
    })

    return {
      label: 'File',
      submenu
    }
  }

  /**
   * Edit 메뉴를 생성합니다
   */
  private createEditMenu(editActions: ShortcutAction[], includeDefaults = true): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = []

    if (includeDefaults) {
      submenu.push(
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      )
    }

    if (editActions.length > 0) {
      if (includeDefaults) {
        submenu.push({ type: 'separator' })
      }
      
      editActions.forEach(action => {
        submenu.push({
          label: getMenuLabel(action.name),
          accelerator: getAccelerator(action.name),
          click: () => action.handler(null)
        })
      })
    }

    return {
      label: 'Edit',
      submenu
    }
  }

  /**
   * View 메뉴를 생성합니다
   */
  private createViewMenu(viewActions: ShortcutAction[]): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = []
    
    viewActions.forEach(action => {
      submenu.push({
        label: getMenuLabel(action.name),
        accelerator: getAccelerator(action.name),
        click: () => action.handler(null)
      })
    })

    return {
      label: 'View',
      submenu
    }
  }

  /**
   * Navigation 메뉴를 생성합니다
   */
  private createNavigationMenu(navigationActions: ShortcutAction[]): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = []
    
    navigationActions.forEach(action => {
      submenu.push({
        label: getMenuLabel(action.name),
        accelerator: getAccelerator(action.name),
        click: () => action.handler(null)
      })
    })

    return {
      label: 'Navigation',
      submenu
    }
  }

  /**
   * Window 메뉴를 생성합니다
   */
  private createWindowMenu(): MenuItemConstructorOptions {
    return {
      label: 'Window',
      submenu: [
        { label: 'Minimize', accelerator: 'Command+M', role: 'minimize' },
        { label: 'Zoom', role: 'zoom' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' }
      ]
    }
  }
}