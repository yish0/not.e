export { MenuManager } from './menu-manager'
export type { IMenuManager, MenuConfiguration } from './menu-types'
export { DEFAULT_MENU_CONFIGURATION } from './menu-types'
export { getMenuLabel, getAccelerator } from './menu-config'

// Singleton instance
let menuManagerInstance: MenuManager | null = null

export function getMenuManager(): MenuManager {
  if (!menuManagerInstance) {
    menuManagerInstance = new MenuManager()
  }
  return menuManagerInstance
}

export function resetMenuManager(): void {
  if (menuManagerInstance) {
    menuManagerInstance.cleanup()
  }
  menuManagerInstance = null
}