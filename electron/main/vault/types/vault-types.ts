import { BrowserWindow } from 'electron'

// Core Vault Types
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

// Repository Interfaces
export interface AppConfigRepository {
  load(): Promise<AppConfig>
  save(config: AppConfig): Promise<void>
  getPath(): string
}

export interface VaultRepository {
  validatePath(path: string): Promise<VaultValidationResult>
  createStructure(path: string, name: string): Promise<void>
  loadMetadata(path: string): Promise<VaultMetadata | null>
  saveMetadata(path: string, metadata: VaultMetadata): Promise<void>
}

// Service Interfaces
export interface VaultDialogService {
  showSelectionDialog(window?: BrowserWindow): Promise<string | null>
  showCreateDialog(window?: BrowserWindow): Promise<{ path: string; name: string } | null>
}

export interface VaultInitializerService {
  initialize(path: string, name?: string): Promise<VaultInitResult>
  validate(path: string): Promise<VaultValidationResult>
}

export interface VaultManagerService {
  initialize(): Promise<void>
  getCurrentVault(): Promise<VaultConfig | null>
  setCurrentVault(path: string): Promise<VaultInitResult>
  getRecentVaults(): Promise<VaultConfig[]>
  removeFromRecent(path: string): Promise<void>
  shouldShowSelector(): boolean
  setShowSelector(show: boolean): Promise<void>
}

// Additional types for testing and future features
export interface ChannelConfig {
  id: string
  name: string
  path: string
  type: string
}

export interface WorkspaceConfig {
  id: string
  name: string
  description?: string
  channels: ChannelConfig[]
  createdAt: string
}
