// 단축키 시스템의 공개 API
export { ShortcutManager } from './managers'
export { ShortcutConfigManager } from './config'
export { DefaultActionExecutor } from './actions'
export { ElectronGlobalShortcutManager } from './managers'
export { ElectronLocalShortcutManager } from './managers'

export type {
  ShortcutConfig,
  ShortcutAction,
  GlobalShortcutManager,
  LocalShortcutManager,
  ActionExecutor
} from './types'

export type { ShortcutConfigData } from './config'

// 편의 함수들
import { ShortcutManager } from './managers'

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
