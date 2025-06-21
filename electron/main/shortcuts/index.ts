// 단축키 시스템의 공개 API
export { ShortcutManager } from './shortcut-manager'
export { ShortcutConfigManager } from './config-manager'
export { DefaultActionExecutor } from './action-executor'
export { ElectronGlobalShortcutManager } from './global-shortcut-manager'
export { ElectronLocalShortcutManager } from './local-shortcut-manager'

export type {
  ShortcutConfig,
  ShortcutAction,
  GlobalShortcutManager,
  LocalShortcutManager,
  ActionExecutor
} from './types'

export type { ShortcutConfigData } from './config-manager'

// 편의 함수들
import { ShortcutManager } from './shortcut-manager'

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