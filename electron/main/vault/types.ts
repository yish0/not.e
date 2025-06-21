export interface VaultConfig {
  path: string
  name: string
  createdAt: string
  lastAccessed: string
  isDefault?: boolean
}

export interface VaultMetadata {
  version: string
  name: string
  description?: string
  createdAt: string
  lastModified: string
}

export interface AppConfig {
  currentVault?: string
  recentVaults: VaultConfig[]
  showVaultSelector: boolean
  lastUsedVault?: string
}

export interface VaultInitResult {
  success: boolean
  vault?: VaultConfig
  error?: string
  isNewVault?: boolean
}

export interface VaultValidationResult {
  isValid: boolean
  isExisting: boolean
  canWrite: boolean
  error?: string
  metadata?: VaultMetadata
}
