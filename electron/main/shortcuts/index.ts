// 단축키 시스템의 공개 API
export { ShortcutManager } from './managers/shortcut-manager'
export { ShortcutConfigManager } from './config/config-manager'
export { DefaultActionExecutor } from './actions/action-executor'
export { ElectronGlobalShortcutManager } from './managers/global-shortcut-manager'
export { ElectronLocalShortcutManager } from './managers/local-shortcut-manager'

export type {
  ShortcutConfig,
  ShortcutAction,
  GlobalShortcutManager,
  LocalShortcutManager,
  ActionExecutor
} from './types/shortcut-types'

export type { ShortcutConfigData } from './config/config-manager'

// 편의 함수들
import { ShortcutManager } from './managers/shortcut-manager'

// 싱글톤 인스턴스
let shortcutManagerInstance: ShortcutManager | null = null

export function getShortcutManager(): ShortcutManager {
  if (!shortcutManagerInstance) {
    shortcutManagerInstance = new ShortcutManager()
  }
  return shortcutManagerInstance
}

export function resetShortcutManager(): void {
  if (shortcutManagerInstance) {
    shortcutManagerInstance.unregisterAllGlobalShortcuts()
    shortcutManagerInstance = null
  }
}
