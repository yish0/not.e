/**
 * Global Application Settings Repository
 * 
 * Manages global application settings stored in ~/.not.e/
 * These settings apply across all vaults and persist globally.
 */

import { promises as fs } from 'fs'
import type { AppSettings, GlobalAppSettingsRepository } from '../types/vault-types'
import { GlobalAppPaths } from '../../../config/vault-paths'

export class FileGlobalAppSettingsRepository implements GlobalAppSettingsRepository {
  getPath(): string {
    return GlobalAppPaths.getGlobalAppConfigPath()
  }

  private getConfigDirectory(): string {
    return GlobalAppPaths.getGlobalAppDir()
  }

  async ensureConfigDirectory(): Promise<void> {
    const configDir = this.getConfigDirectory()
    try {
      await fs.mkdir(configDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create global app config directory:', error)
      throw new Error(
        `Failed to create global app config directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async load(): Promise<AppSettings> {
    const configPath = this.getPath()
    
    try {
      const data = await fs.readFile(configPath, 'utf-8')
      const rawSettings = JSON.parse(data) as AppSettings
      const migratedSettings = this.migrateOldSettings(rawSettings)
      const settings = { ...this.getDefaultSettings(), ...migratedSettings }

      // Save migrated settings if changes were made
      if (this.needsMigration(rawSettings)) {
        await this.save(settings)
      }

      return settings
    } catch (error) {
      console.log('No existing global app settings found, using defaults')
      const defaultSettings = this.getDefaultSettings()
      await this.save(defaultSettings)
      return defaultSettings
    }
  }

  async save(settings: AppSettings): Promise<void> {
    try {
      await this.ensureConfigDirectory()
      const configPath = this.getPath()
      const data = JSON.stringify(settings, null, 2)
      await fs.writeFile(configPath, data, 'utf-8')
    } catch (error) {
      console.error('Failed to save global app settings:', error)
      throw new Error(
        `Failed to save global app settings: ${error instanceof Error ? error.message : 'Unknown error'}`
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