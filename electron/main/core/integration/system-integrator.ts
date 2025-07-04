import { BrowserWindow } from 'electron'
import { getShortcutManager } from '../../shortcuts'
import { getAllDefaultActions } from '../../actions/index'
import { getVaultManager } from '../../vault'
import { setupIPCHandlers } from '../../ipc'
import { getMenuManager } from '../../ui/menu'
import type { MenuConfiguration } from '../../ui/menu/menu-types'
import { DEFAULT_MENU_CONFIGURATION } from '../../ui/menu/menu-types'
import type { ShortcutAction } from '../../shortcuts/types/shortcut-types'

export interface SystemInitializationResult {
  success: boolean
  error?: string
}

export interface SystemIntegrator {
  initializeVaultSystem(): Promise<SystemInitializationResult>
  initializeShortcutSystem(): Promise<SystemInitializationResult>
  initializeMenuSystem(): Promise<SystemInitializationResult>
  setupWindowIntegration(window: BrowserWindow): Promise<void>
  registerDefaultActions(): void
  updateMenuWithActions(actions: ShortcutAction[]): Promise<void>
  updateMenuConfiguration(config: MenuConfiguration): Promise<void>
  addActionToMenu(action: ShortcutAction): Promise<void>
  removeActionFromMenu(actionName: string): Promise<void>
  cleanup(): void
}

export class DefaultSystemIntegrator implements SystemIntegrator {
  private shortcutManager = getShortcutManager()
  private vaultManager = getVaultManager()
  private menuManager = getMenuManager()
  private registeredActions: ShortcutAction[] = []

  async initializeVaultSystem(): Promise<SystemInitializationResult> {
    try {
      // Vault 시스템 초기화
      await this.vaultManager.initialize()

      // 현재 설정된 Vault가 있는지 확인
      const currentVault = await this.vaultManager.getCurrentVault()

      if (currentVault) {
        // 기존 Vault가 있으면 validation 후 사용
        console.log(`Using existing vault: ${currentVault.name} at ${currentVault.path}`)
        return { success: true }
      }

      // Vault가 없거나 선택기 표시가 필요한 경우에만 다이얼로그 표시
      const shouldShowSelector = this.vaultManager.shouldShowVaultSelector()
      if (shouldShowSelector) {
        const result = await this.vaultManager.showVaultSelectionDialog()
        if (!result.success) {
          return {
            success: false,
            error: 'No vault selected by user'
          }
        }
        console.log(`Vault initialized: ${result.vault?.name} at ${result.vault?.path}`)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown vault initialization error'
      }
    }
  }

  async initializeShortcutSystem(): Promise<SystemInitializationResult> {
    try {
      // 단축키 시스템 초기화
      await this.shortcutManager.initialize()

      // 기본 액션들 등록
      this.registerDefaultActions()

      // 전역 단축키 등록
      await this.shortcutManager.setupGlobalShortcuts()

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown shortcut initialization error'
      }
    }
  }

  async setupWindowIntegration(window: BrowserWindow): Promise<void> {
    // 윈도우별 로컬 단축키 등록
    await this.shortcutManager.setupWindow(window)

    // IPC 핸들러 설정
    setupIPCHandlers({ mainWindow: window })
  }

  async initializeMenuSystem(): Promise<SystemInitializationResult> {
    try {
      // 등록된 액션이 없다면 기본 액션 사용
      if (this.registeredActions.length === 0) {
        const actions = getAllDefaultActions()
        this.registeredActions = [...actions]
      }
      
      // 기본 액션들과 함께 메뉴 초기화
      this.menuManager.initializeWithActions(this.registeredActions, DEFAULT_MENU_CONFIGURATION)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown menu initialization error'
      }
    }
  }

  async setupWindowIntegration(window: BrowserWindow): Promise<void> {
    // 메뉴가 설정되지 않았다면 초기화
    if (!this.menuManager.isMenuSet()) {
      await this.initializeMenuSystem()
    }

    // 윈도우별 로컬 단축키 등록
    await this.shortcutManager.setupWindow(window)

    // IPC 핸들러 설정
    setupIPCHandlers({ mainWindow: window })
  }

  registerDefaultActions(): void {
    const actions = getAllDefaultActions()
    this.registeredActions = [...actions]
    
    actions.forEach((action) => {
      this.shortcutManager.registerAction(
        action.name,
        action.handler,
        action.description,
        action.category
      )
    })
    console.log(`Registered ${actions.length} default actions`)
  }

  async updateMenuWithActions(actions: ShortcutAction[]): Promise<void> {
    this.registeredActions = [...actions]
    this.menuManager.updateMenu(actions, DEFAULT_MENU_CONFIGURATION)
  }

  async updateMenuConfiguration(config: MenuConfiguration): Promise<void> {
    this.menuManager.updateMenu(this.registeredActions, config)
  }

  async addActionToMenu(action: ShortcutAction): Promise<void> {
    // 액션 등록
    this.shortcutManager.registerAction(
      action.name,
      action.handler,
      action.description,
      action.category
    )
    
    // 등록된 액션 목록에 추가
    this.registeredActions.push(action)
    
    // 메뉴 업데이트
    this.menuManager.updateMenu(this.registeredActions, DEFAULT_MENU_CONFIGURATION)
  }

  async removeActionFromMenu(actionName: string): Promise<void> {
    // 등록된 액션 목록에서 제거
    this.registeredActions = this.registeredActions.filter(
      action => action.name !== actionName
    )
    
    // 메뉴 업데이트
    this.menuManager.updateMenu(this.registeredActions, DEFAULT_MENU_CONFIGURATION)
  }

  cleanup(): void {
    this.menuManager.cleanup()
  }
}

// Singleton instance
let systemIntegratorInstance: SystemIntegrator | null = null

export function getSystemIntegrator(): SystemIntegrator {
  if (!systemIntegratorInstance) {
    systemIntegratorInstance = new DefaultSystemIntegrator()
  }
  return systemIntegratorInstance
}

export function resetSystemIntegrator(): void {
  systemIntegratorInstance = null
}
