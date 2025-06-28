import { promises as fs } from 'fs'
import { join } from 'path'
import type { AppSettings, AppSettingsRepository } from '../types/vault-types'
import { isDev } from '../../../config'
import { VaultPathUtils } from '../../../config/vault-paths'
import { VAULT_DIRECTORIES } from '../../../config/vault-constants'

/**
 * Vault-specific App Settings Repository
 * 
 * Manages vault-specific application settings stored in vault/.not.e/
 * These settings are specific to each vault and can override global settings.
 */
export class FileAppSettingsRepository implements AppSettingsRepository {
  private getConfigPath(vaultPath: string): string {
    return VaultPathUtils.getVaultAppConfigPath(vaultPath)
  }

  private getConfigDirectory(vaultPath: string): string {
    return VaultPathUtils.getAppConfigDir(vaultPath)
  }

  getPath(vaultPath: string): string {
    return this.getConfigPath(vaultPath)
  }

  async ensureConfigDirectory(vaultPath: string): Promise<void> {
    const configDir = this.getConfigDirectory(vaultPath)
    try {
      await fs.mkdir(configDir, { recursive: true })
    } catch (error) {
      console.error(`Failed to create ${VAULT_DIRECTORIES.APP_CONFIG} directory:`, error)
      throw new Error(
        `Failed to create ${VAULT_DIRECTORIES.APP_CONFIG} directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async load(vaultPath: string): Promise<AppSettings> {
    const configPath = this.getConfigPath(vaultPath)
    
    try {
      const data = await fs.readFile(configPath, 'utf-8')
      const rawSettings = JSON.parse(data) as AppSettings
      const migratedSettings = this.migrateOldSettings(rawSettings)
      const settings = { ...this.getDefaultSettings(), ...migratedSettings }

      // Save migrated settings if changes were made
      if (this.needsMigration(rawSettings)) {
        await this.save(vaultPath, settings)
      }

      return settings
    } catch (error) {
      console.log(`No existing app settings found for vault ${vaultPath}, using defaults`)
      const defaultSettings = this.getDefaultSettings()
      await this.save(vaultPath, defaultSettings)
      return defaultSettings
    }
  }

  async save(vaultPath: string, settings: AppSettings): Promise<void> {
    try {
      await this.ensureConfigDirectory(vaultPath)
      const configPath = this.getConfigPath(vaultPath)
      const data = JSON.stringify(settings, null, 2)
      await fs.writeFile(configPath, data, 'utf-8')
    } catch (error) {
      console.error('Failed to save app settings:', error)
      throw new Error(
        `Failed to save app settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      windowMode: 'normal',
      toggleSettings: {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
    }
  }

  private needsMigration(settings: AppSettings): boolean {
    return settings.enableCrossDesktopToggle !== undefined || settings.windowMode === undefined
  }

  private migrateOldSettings(settings: AppSettings): AppSettings {
    const migratedSettings = { ...settings }

    // Migrate enableCrossDesktopToggle to new windowMode system
    if (settings.enableCrossDesktopToggle !== undefined) {
      // If cross-desktop toggle was enabled, set to toggle mode with standard type
      migratedSettings.windowMode = settings.enableCrossDesktopToggle ? 'toggle' : 'normal'
      migratedSettings.toggleSettings = {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
      // Remove the old field
      delete migratedSettings.enableCrossDesktopToggle
    }

    // Ensure windowMode is set
    if (!migratedSettings.windowMode) {
      migratedSettings.windowMode = 'normal'
    }

    // Ensure toggleSettings exist if in toggle mode
    if (migratedSettings.windowMode === 'toggle' && !migratedSettings.toggleSettings) {
      migratedSettings.toggleSettings = {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
    }

    return migratedSettings
  }
}