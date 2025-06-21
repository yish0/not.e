import { VaultManager } from './vault-manager'
import { VaultFactory } from './vault-factory'

// Public API exports
export { VaultManager } from './vault-manager'
export { VaultFactory } from './vault-factory'

// Type exports
export type {
  VaultConfig,
  VaultMetadata,
  AppConfig,
  VaultInitResult,
  VaultValidationResult
} from './interfaces'

// Singleton instance
let vaultManagerInstance: VaultManager | null = null

export function getVaultManager(): VaultManager {
  if (!vaultManagerInstance) {
    vaultManagerInstance = new VaultManager()
  }
  return vaultManagerInstance
}

export function resetVaultManager(): void {
  vaultManagerInstance = null
  VaultFactory.reset()
}
