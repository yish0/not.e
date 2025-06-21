import type {
  VaultManagerService,
  AppConfigRepository,
  VaultInitializerService,
  VaultConfig,
  VaultInitResult,
  AppConfig
} from '../types/'

export class DefaultVaultManagerService implements VaultManagerService {
  private appConfig: AppConfig

  constructor(
    private configRepository: AppConfigRepository,
    private initializerService: VaultInitializerService
  ) {
    this.appConfig = { recentVaults: [], showVaultSelector: true }
  }

  async initialize(): Promise<void> {
    this.appConfig = await this.configRepository.load()
  }

  async getCurrentVault(): Promise<VaultConfig | null> {
    if (!this.appConfig.currentVault) {
      return null
    }

    const vault = this.appConfig.recentVaults.find((v) => v.path === this.appConfig.currentVault)
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
    return [...this.appConfig.recentVaults]
  }

  async removeFromRecent(vaultPath: string): Promise<void> {
    this.appConfig.recentVaults = this.appConfig.recentVaults.filter((v) => v.path !== vaultPath)

    if (this.appConfig.currentVault === vaultPath) {
      this.appConfig.currentVault = undefined
    }

    await this.configRepository.save(this.appConfig)
  }

  shouldShowSelector(): boolean {
    return this.appConfig.showVaultSelector || !this.appConfig.currentVault
  }

  async setShowSelector(show: boolean): Promise<void> {
    this.appConfig.showVaultSelector = show
    await this.configRepository.save(this.appConfig)
  }

  private async updateAppConfigWithVault(vault: VaultConfig): Promise<void> {
    // 최근 Vault 목록 업데이트
    const existingIndex = this.appConfig.recentVaults.findIndex((v) => v.path === vault.path)

    if (existingIndex >= 0) {
      // 기존 Vault 업데이트
      this.appConfig.recentVaults[existingIndex] = vault
    } else {
      // 새 Vault 추가 (최대 10개까지 유지)
      this.appConfig.recentVaults.unshift(vault)
      if (this.appConfig.recentVaults.length > 10) {
        this.appConfig.recentVaults = this.appConfig.recentVaults.slice(0, 10)
      }
    }

    // 현재 Vault 설정
    this.appConfig.currentVault = vault.path
    this.appConfig.lastUsedVault = vault.path

    await this.configRepository.save(this.appConfig)
  }
}
