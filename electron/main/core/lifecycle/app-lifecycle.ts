import { app, BrowserWindow } from 'electron'
import { getWindowManager, type WindowConfig } from '../window/window-manager'
import { getSystemIntegrator } from '../integration/system-integrator'

export interface AppLifecycleManager {
  initialize(): Promise<void>
  createMainWindow(config?: WindowConfig): Promise<BrowserWindow>
  handleActivation(): void
  handleWindowsClosed(): void
}

export class DefaultAppLifecycleManager implements AppLifecycleManager {
  private windowManager = getWindowManager()
  private systemIntegrator = getSystemIntegrator()

  async initialize(): Promise<void> {
    await app.whenReady()

    // 시스템 초기화
    await this.initializeSystems()

    // 메인 윈도우 생성
    await this.createMainWindow()

    // 앱 이벤트 리스너 등록
    this.setupAppEventListeners()
  }

  async createMainWindow(config?: WindowConfig): Promise<BrowserWindow> {
    const window = this.windowManager.createMainWindow(config)
    this.windowManager.setMainWindow(window)

    // 윈도우 통합 설정
    await this.systemIntegrator.setupWindowIntegration(window)

    return window
  }

  handleActivation(): void {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createMainWindow()
    }
  }

  handleWindowsClosed(): void {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  }

  private async initializeSystems(): Promise<void> {
    // Vault 시스템 초기화
    const vaultResult = await this.systemIntegrator.initializeVaultSystem()
    if (!vaultResult.success) {
      console.error('Vault initialization failed:', vaultResult.error)
      app.quit()
      return
    }

    // 단축키 시스템 초기화
    const shortcutResult = await this.systemIntegrator.initializeShortcutSystem()
    if (!shortcutResult.success) {
      console.error('Shortcut system initialization failed:', shortcutResult.error)
      // 단축키 실패는 앱을 종료하지 않음
    }
  }

  private setupAppEventListeners(): void {
    app.on('activate', () => {
      this.handleActivation()
    })

    app.on('window-all-closed', () => {
      this.handleWindowsClosed()
    })
  }
}

// Singleton instance
let appLifecycleInstance: AppLifecycleManager | null = null

export function getAppLifecycleManager(): AppLifecycleManager {
  if (!appLifecycleInstance) {
    appLifecycleInstance = new DefaultAppLifecycleManager()
  }
  return appLifecycleInstance
}

export function resetAppLifecycleManager(): void {
  appLifecycleInstance = null
}