import { BrowserWindow } from 'electron'
import { VaultFactory } from '../core/vault-factory'
import type {
  VaultManagerService,
  VaultDialogService,
  VaultConfig,
  VaultInitResult
} from '../types/vault-types'

export class VaultManager {
  private managerService: VaultManagerService
  private dialogService: VaultDialogService

  constructor() {
    this.managerService = VaultFactory.createVaultManager()
    this.dialogService = VaultFactory.createDialogService()
  }

  async initialize(): Promise<void> {
    await this.managerService.initialize()
  }

  async showVaultSelectionDialog(window?: BrowserWindow): Promise<VaultInitResult> {
    const selectedPath = await this.dialogService.showSelectionDialog(window)

    if (!selectedPath) {
      return { success: false, error: 'User cancelled vault selection' }
    }

    return await this.managerService.setCurrentVault(selectedPath)
  }

  async getCurrentVault(): Promise<VaultConfig | null> {
    return await this.managerService.getCurrentVault()
  }

  async setCurrentVault(vaultPath: string): Promise<VaultInitResult> {
    return await this.managerService.setCurrentVault(vaultPath)
  }

  async getRecentVaults(): Promise<VaultConfig[]> {
    return await this.managerService.getRecentVaults()
  }

  async removeVaultFromRecent(vaultPath: string): Promise<void> {
    await this.managerService.removeFromRecent(vaultPath)
  }

  shouldShowVaultSelector(): boolean {
    return this.managerService.shouldShowSelector()
  }

  async setShowVaultSelector(show: boolean): Promise<void> {
    await this.managerService.setShowSelector(show)
  }
}
