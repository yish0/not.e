import { VaultManager } from './managers'
import { VaultFactory } from './core'

// Public API exports
export { VaultManager } from './managers'
export { VaultFactory } from './core'

// Type exports
export type {
  VaultConfig,
  VaultMetadata,
  AppConfig,
  VaultInitResult,
  VaultValidationResult
} from './types'

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
