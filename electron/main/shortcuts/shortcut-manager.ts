import { BrowserWindow, app } from 'electron'
import {
  type ShortcutConfig,
  type GlobalShortcutManager,
  type LocalShortcutManager,
  type ActionExecutor,
  type ShortcutActionHandler,
  ShortcutCategory
} from './types'
import { ElectronGlobalShortcutManager } from './global-shortcut-manager'
import { ElectronLocalShortcutManager } from './local-shortcut-manager'
import { DefaultActionExecutor } from './action-executor'
import { ShortcutConfigManager } from './config-manager'

export class ShortcutManager {
  private globalManager: GlobalShortcutManager
  private localManager: LocalShortcutManager
  private actionExecutor: ActionExecutor
  private configManager: ShortcutConfigManager
  private isInitialized = false

  constructor() {
    this.actionExecutor = new DefaultActionExecutor()
    this.globalManager = new ElectronGlobalShortcutManager(this.actionExecutor)
    this.localManager = new ElectronLocalShortcutManager(this.actionExecutor)
    this.configManager = new ShortcutConfigManager()

    this.setupCleanup()
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.configManager.loadConfig()
      this.isInitialized = true
      console.log('ShortcutManager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize ShortcutManager:', error)
      throw error
    }
  }

  // 설정 기반 전역 단축키 일괄 등록
  async registerGlobalShortcutsFromConfig(): Promise<void> {
    await this.ensureInitialized()

    const globalShortcuts = this.configManager.getGlobalShortcuts()
    const results = []

    for (const shortcut of globalShortcuts) {
      const success = this.globalManager.register(shortcut.key, shortcut.action)
      results.push({ key: shortcut.key, success })

      if (!success) {
        console.warn(`Failed to register global shortcut: ${shortcut.key}`)
      }
    }

    console.log(
      `Registered ${results.filter((r) => r.success).length}/${results.length} global shortcuts`
    )
  }

  // 설정 기반 로컬 단축키 일괄 등록
  async registerLocalShortcutsFromConfig(window: BrowserWindow): Promise<void> {
    await this.ensureInitialized()

    const localShortcuts = this.configManager.getLocalShortcuts()
    const results = []

    for (const shortcut of localShortcuts) {
      const success = this.localManager.register(window, shortcut.key, shortcut.action)
      results.push({ key: shortcut.key, success })

      if (!success) {
        console.warn(`Failed to register local shortcut: ${shortcut.key}`)
      }
    }

    console.log(
      `Registered ${results.filter((r) => r.success).length}/${results.length} local shortcuts for window ${window.id}`
    )
  }

  // 개별 전역 단축키 등록 (설정에도 저장)
  async registerGlobalShortcut(
    key: string,
    action: string,
    description: string,
    category: string = 'custom'
  ): Promise<boolean> {
    await this.ensureInitialized()

    const config: ShortcutConfig = { key, action, description, category }

    // 설정에 추가
    if (!this.configManager.addGlobalShortcut(config)) {
      console.warn(`Global shortcut ${key} already exists in config`)
      return false
    }

    // 실제 등록
    const success = this.globalManager.register(key, action)

    if (success) {
      await this.configManager.saveConfig()
    } else {
      // 실패 시 설정에서 제거
      this.configManager.removeGlobalShortcut(key)
    }

    return success
  }

  // 개별 로컬 단축키 등록 (설정에도 저장)
  async registerLocalShortcut(
    window: BrowserWindow,
    key: string,
    action: string,
    description: string,
    category: ShortcutCategory = ShortcutCategory.CUSTOM
  ): Promise<boolean> {
    await this.ensureInitialized()

    const config: ShortcutConfig = { key, action, description, category }

    // 설정에 추가
    if (!this.configManager.addLocalShortcut(config)) {
      console.warn(`Local shortcut ${key} already exists in config`)
      return false
    }

    // 실제 등록
    const success = this.localManager.register(window, key, action)

    if (success) {
      await this.configManager.saveConfig()
    } else {
      // 실패 시 설정에서 제거
      this.configManager.removeLocalShortcut(key)
    }

    return success
  }

  // 전역 단축키 해제 (설정에서도 제거)
  async unregisterGlobalShortcut(key: string): Promise<boolean> {
    await this.ensureInitialized()

    const success = this.globalManager.unregister(key)

    if (success) {
      this.configManager.removeGlobalShortcut(key)
      await this.configManager.saveConfig()
    }

    return success
  }

  // 로컬 단축키 해제 (설정에서도 제거)
  async unregisterLocalShortcut(window: BrowserWindow, key: string): Promise<boolean> {
    await this.ensureInitialized()

    const success = this.localManager.unregister(window, key)

    if (success) {
      this.configManager.removeLocalShortcut(key)
      await this.configManager.saveConfig()
    }

    return success
  }

  // 모든 전역 단축키 해제
  unregisterAllGlobalShortcuts(): void {
    this.globalManager.unregisterAll()
  }

  // 특정 윈도우의 모든 로컬 단축키 해제
  unregisterAllLocalShortcuts(window: BrowserWindow): void {
    this.localManager.unregisterAll(window)
  }

  // 액션 등록
  registerAction(
    name: string,
    handler: ShortcutActionHandler,
    description: string,
    category: ShortcutCategory
  ): void {
    this.actionExecutor.registerAction({ name, handler, description, category })
  }

  // 설정 관련 메소드
  async getShortcutConfigs(): Promise<ShortcutConfig[]> {
    await this.ensureInitialized()
    return this.configManager.getAllShortcuts()
  }

  async getGlobalShortcutConfigs(): Promise<ShortcutConfig[]> {
    await this.ensureInitialized()
    return this.configManager.getGlobalShortcuts()
  }

  async getLocalShortcutConfigs(): Promise<ShortcutConfig[]> {
    await this.ensureInitialized()
    return this.configManager.getLocalShortcuts()
  }

  async getShortcutsByCategory(category: string): Promise<ShortcutConfig[]> {
    await this.ensureInitialized()
    return this.configManager.getShortcutsByCategory(category)
  }

  // 설정 업데이트
  async updateGlobalShortcut(key: string, newConfig: Partial<ShortcutConfig>): Promise<boolean> {
    await this.ensureInitialized()

    const success = this.configManager.updateGlobalShortcut(key, newConfig)
    if (success) {
      await this.configManager.saveConfig()

      // 단축키가 변경된 경우 재등록
      if (newConfig.key && newConfig.key !== key) {
        this.globalManager.unregister(key)
        if (newConfig.action) {
          this.globalManager.register(newConfig.key, newConfig.action)
        }
      }
    }

    return success
  }

  async updateLocalShortcut(key: string, newConfig: Partial<ShortcutConfig>): Promise<boolean> {
    await this.ensureInitialized()

    const success = this.configManager.updateLocalShortcut(key, newConfig)
    if (success) {
      await this.configManager.saveConfig()
    }

    return success
  }

  // 설정 초기화
  async resetToDefault(): Promise<void> {
    await this.ensureInitialized()

    // 모든 등록된 단축키 해제
    this.unregisterAllGlobalShortcuts()

    // 설정 초기화
    this.configManager.resetToDefault()
    await this.configManager.saveConfig()

    // 기본 단축키 재등록
    await this.registerGlobalShortcutsFromConfig()
  }

  // 충돌 검사
  async hasGlobalShortcutConflict(key: string): Promise<boolean> {
    await this.ensureInitialized()
    return this.configManager.hasConflict(key, 'global')
  }

  async hasLocalShortcutConflict(key: string): Promise<boolean> {
    await this.ensureInitialized()
    return this.configManager.hasConflict(key, 'local')
  }

  // 편의 메소드: 윈도우에 모든 단축키 등록
  async setupWindow(window: BrowserWindow): Promise<void> {
    await this.registerLocalShortcutsFromConfig(window)

    // 윈도우가 닫힐 때 정리
    window.once('closed', () => {
      this.unregisterAllLocalShortcuts(window)
    })
  }

  // 편의 메소드: 앱 시작 시 전역 단축키 등록
  async setupGlobalShortcuts(): Promise<void> {
    await this.registerGlobalShortcutsFromConfig()
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }
  }

  private setupCleanup(): void {
    app.on('will-quit', () => {
      this.unregisterAllGlobalShortcuts()
    })

    app.on('window-all-closed', () => {
      this.unregisterAllGlobalShortcuts()
    })
  }
}
