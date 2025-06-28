import type { AppConfig, AppConfigRepository, VaultSelectionConfig, AppSettings } from '../types/vault-types'
import { FileVaultSelectionConfigRepository } from './vault-selection-config-repository'
import { FileAppSettingsRepository } from './app-settings-repository'

export class FileAppConfigRepository implements AppConfigRepository {
  private vaultSelectionRepo: FileVaultSelectionConfigRepository
  private appSettingsRepo: FileAppSettingsRepository
  private currentVaultPath?: string

  constructor(vaultPath?: string) {
    this.vaultSelectionRepo = new FileVaultSelectionConfigRepository()
    this.appSettingsRepo = new FileAppSettingsRepository()
    this.currentVaultPath = vaultPath
  }

  getPath(): string {
    // Return vault selection config path for legacy compatibility
    return this.vaultSelectionRepo.getPath()
  }

  setCurrentVaultPath(vaultPath: string): void {
    this.currentVaultPath = vaultPath
  }

  async load(): Promise<AppConfig> {
    const vaultSelectionConfig = await this.vaultSelectionRepo.load()
    
    let appSettings: AppSettings
    if (this.currentVaultPath || vaultSelectionConfig.currentVault) {
      const vaultPath = this.currentVaultPath || vaultSelectionConfig.currentVault!
      appSettings = await this.appSettingsRepo.load(vaultPath)
    } else {
      // No vault selected, use default settings
      appSettings = this.getDefaultAppSettings()
    }

    // Combine both configs for backward compatibility
    const combinedConfig: AppConfig = {
      ...vaultSelectionConfig,
      ...appSettings
    }

    return combinedConfig
  }

  async save(config: AppConfig): Promise<void> {
    // Split config into vault selection and app settings
    const vaultSelectionConfig: VaultSelectionConfig = {
      currentVault: config.currentVault,
      recentVaults: config.recentVaults,
      showVaultSelector: config.showVaultSelector,
      lastUsedVault: config.lastUsedVault
    }

    const appSettings: AppSettings = {
      windowMode: config.windowMode,
      toggleSettings: config.toggleSettings,
      enableCrossDesktopToggle: config.enableCrossDesktopToggle
    }

    // Save vault selection config
    await this.vaultSelectionRepo.save(vaultSelectionConfig)

    // Save app settings if vault is available
    const vaultPath = this.currentVaultPath || config.currentVault
    if (vaultPath) {
      await this.appSettingsRepo.save(vaultPath, appSettings)
    }
  }

  private getDefaultAppSettings(): AppSettings {
    return {
      windowMode: 'normal',
      toggleSettings: {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
    }
  }

  // Legacy method for migration from old userData config
  async migrateFromLegacyConfig(): Promise<void> {
    const { app } = await import('electron')
    const { join } = await import('path')
    const { promises: fs } = await import('fs')
    const { isDev } = await import('../../../config')

    const legacyConfigFileName = isDev ? 'app-config.dev.json' : 'app-config.json'
    const legacyConfigPath = join(app.getPath('userData'), legacyConfigFileName)

    try {
      // Check if legacy config exists
      const legacyData = await fs.readFile(legacyConfigPath, 'utf-8')
      const legacyConfig = JSON.parse(legacyData) as AppConfig

      console.log('Found legacy config, migrating to new structure...')

      // Split into vault selection and app settings
      const vaultSelectionConfig = {
        currentVault: legacyConfig.currentVault,
        recentVaults: legacyConfig.recentVaults,
        showVaultSelector: legacyConfig.showVaultSelector,
        lastUsedVault: legacyConfig.lastUsedVault
      }

      const appSettings = {
        windowMode: legacyConfig.windowMode || 'normal',
        toggleSettings: legacyConfig.toggleSettings || {
          toggleType: 'standard' as const,
          sidebarPosition: 'right' as const,
          sidebarWidth: 400
        },
        enableCrossDesktopToggle: legacyConfig.enableCrossDesktopToggle
      }

      // Save vault selection config
      await this.vaultSelectionRepo.save(vaultSelectionConfig)

      // Save app settings if current vault exists
      if (legacyConfig.currentVault) {
        await this.appSettingsRepo.save(legacyConfig.currentVault, appSettings)
        console.log(`Migrated app settings to vault: ${legacyConfig.currentVault}`)
      }

      // Backup and remove legacy config
      const backupPath = legacyConfigPath + '.backup'
      await fs.rename(legacyConfigPath, backupPath)
      console.log(`Legacy config backed up to: ${backupPath}`)
      console.log('Migration completed successfully')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('No legacy config found, skipping migration')
      } else {
        console.error('Failed to migrate legacy config:', error)
        throw error
      }
    }
  }
}
