import type {
  VaultManagerService,
  AppConfigRepository,
  VaultInitializerService,
  VaultConfig,
  VaultInitResult,
  VaultSelectionConfig
} from '../types/vault-types'
import { FileVaultSelectionConfigRepository } from '../repositories/vault-selection-config-repository'
import { FileAppSettingsRepository } from '../repositories/app-settings-repository'

export class DefaultVaultManagerService implements VaultManagerService {
  private vaultSelectionConfig: VaultSelectionConfig
  private vaultSelectionRepo: FileVaultSelectionConfigRepository
  private appSettingsRepo: FileAppSettingsRepository

  constructor(
    private configRepository: AppConfigRepository,
    private initializerService: VaultInitializerService
  ) {
    this.vaultSelectionRepo = new FileVaultSelectionConfigRepository()
    this.appSettingsRepo = new FileAppSettingsRepository()
    this.vaultSelectionConfig = {
      recentVaults: [],
      showVaultSelector: true
    }
  }

  async initialize(): Promise<void> {
    // Try to migrate from legacy config first
    await this.configRepository.migrateFromLegacyConfig()
    
    this.vaultSelectionConfig = await this.vaultSelectionRepo.load()
    
    // Update the legacy config repository with current vault path
    if (this.vaultSelectionConfig.currentVault) {
      this.configRepository.setCurrentVaultPath(this.vaultSelectionConfig.currentVault)
    }
  }

  async getCurrentVault(): Promise<VaultConfig | null> {
    if (!this.vaultSelectionConfig.currentVault) {
      return null
    }

    const vault = this.vaultSelectionConfig.recentVaults.find((v) => v.path === this.vaultSelectionConfig.currentVault)
    return vault || null
  }

  async setCurrentVault(vaultPath: string): Promise<VaultInitResult> {
    const result = await this.initializerService.initialize(vaultPath)

    if (result.success && result.vault) {
      await this.updateAppConfigWithVault(result.vault)
    }

    return result
  }

  async getRecentVaults(): Promise<VaultConfig[]> {
    return [...this.vaultSelectionConfig.recentVaults]
  }

  async removeFromRecent(vaultPath: string): Promise<void> {
    this.vaultSelectionConfig.recentVaults = this.vaultSelectionConfig.recentVaults.filter((v) => v.path !== vaultPath)

    if (this.vaultSelectionConfig.currentVault === vaultPath) {
      this.vaultSelectionConfig.currentVault = undefined
    }

    await this.vaultSelectionRepo.save(this.vaultSelectionConfig)
  }

  shouldShowSelector(): boolean {
    return this.vaultSelectionConfig.showVaultSelector || !this.vaultSelectionConfig.currentVault
  }

  async setShowSelector(show: boolean): Promise<void> {
    this.vaultSelectionConfig.showVaultSelector = show
    await this.vaultSelectionRepo.save(this.vaultSelectionConfig)
  }

  private async updateAppConfigWithVault(vault: VaultConfig): Promise<void> {
    // 최근 Vault 목록 업데이트
    const existingIndex = this.vaultSelectionConfig.recentVaults.findIndex((v) => v.path === vault.path)

    if (existingIndex >= 0) {
      // 기존 Vault 업데이트
      this.vaultSelectionConfig.recentVaults[existingIndex] = vault
    } else {
      // 새 Vault 추가 (최대 10개까지 유지)
      this.vaultSelectionConfig.recentVaults.unshift(vault)
      if (this.vaultSelectionConfig.recentVaults.length > 10) {
        this.vaultSelectionConfig.recentVaults = this.vaultSelectionConfig.recentVaults.slice(0, 10)
      }
    }

    // 현재 Vault 설정
    this.vaultSelectionConfig.currentVault = vault.path
    this.vaultSelectionConfig.lastUsedVault = vault.path

    // Save vault selection config
    await this.vaultSelectionRepo.save(this.vaultSelectionConfig)
    
    // Update legacy config repository with new vault path
    this.configRepository.setCurrentVaultPath(vault.path)
    
    // Ensure app config directory exists in the vault
    await this.appSettingsRepo.ensureConfigDirectory(vault.path)
  }
}
