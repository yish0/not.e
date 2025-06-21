import { BrowserWindow } from 'electron'
import { getShortcutManager } from '../../shortcuts'
import { getAllDefaultActions } from '../../actions'
import { getVaultManager } from '../../vault'
import { setupIPCHandlers } from '../../ipc'

export interface SystemInitializationResult {
  success: boolean
  error?: string
}

export interface SystemIntegrator {
  initializeVaultSystem(): Promise<SystemInitializationResult>
  initializeShortcutSystem(): Promise<SystemInitializationResult>
  setupWindowIntegration(window: BrowserWindow): Promise<void>
  registerDefaultActions(): void
}

export class DefaultSystemIntegrator implements SystemIntegrator {
  private shortcutManager = getShortcutManager()
  private vaultManager = getVaultManager()

  async initializeVaultSystem(): Promise<SystemInitializationResult> {
    try {
      // Vault 시스템 초기화
      await this.vaultManager.initialize()

      // Vault 선택 확인
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

  registerDefaultActions(): void {
    const actions = getAllDefaultActions()
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