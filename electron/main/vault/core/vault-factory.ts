import type { VaultManagerService, VaultDialogService } from '../types'
import { FileAppConfigRepository } from '../repositories/app-config-repository'
import { FileVaultRepository } from '../repositories/vault-repository'
import { ElectronVaultDialogService } from '../services/vault-dialog-service'
import { DefaultVaultInitializerService } from '../services/vault-initializer-service'
import { DefaultVaultManagerService } from '../services/vault-manager-service'

export class VaultFactory {
  private static vaultManagerInstance: VaultManagerService | null = null
  private static dialogServiceInstance: VaultDialogService | null = null

  static createVaultManager(): VaultManagerService {
    if (!this.vaultManagerInstance) {
      const configRepository = new FileAppConfigRepository()
      const vaultRepository = new FileVaultRepository()
      const initializerService = new DefaultVaultInitializerService(vaultRepository)

      this.vaultManagerInstance = new DefaultVaultManagerService(
        configRepository,
        initializerService
      )
    }

    return this.vaultManagerInstance
  }

  static createDialogService(): VaultDialogService {
    if (!this.dialogServiceInstance) {
      this.dialogServiceInstance = new ElectronVaultDialogService()
    }

    return this.dialogServiceInstance
  }

  static reset(): void {
    this.vaultManagerInstance = null
    this.dialogServiceInstance = null
  }
}
