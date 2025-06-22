import { VaultManager } from './managers/vault-manager'
import { VaultFactory } from './core/vault-factory'

// Public API exports
export { VaultManager } from './managers/vault-manager'
export { VaultFactory } from './core/vault-factory'

// Type exports
export type {
  VaultConfig,
  VaultMetadata,
  AppConfig,
  VaultInitResult,
  VaultValidationResult
} from './types/vault-types'

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
