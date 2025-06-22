import { promises as fs } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import type { AppConfig, AppConfigRepository } from '../types/vault-types'

export class FileAppConfigRepository implements AppConfigRepository {
  private configPath: string

  constructor() {
    this.configPath = join(app.getPath('userData'), 'app-config.json')
  }

  getPath(): string {
    return this.configPath
  }

  async load(): Promise<AppConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8')
      const rawConfig = JSON.parse(data) as AppConfig
      const migratedConfig = this.migrateOldConfig(rawConfig)
      const config = { ...this.getDefaultConfig(), ...migratedConfig }

      // Save migrated config if changes were made
      if (this.needsMigration(rawConfig)) {
        await this.save(config)
      }

      return config
    } catch (error) {
      console.log('No existing app config found, using defaults')
      const defaultConfig = this.getDefaultConfig()
      await this.save(defaultConfig)
      return defaultConfig
    }
  }

  async save(config: AppConfig): Promise<void> {
    try {
      const data = JSON.stringify(config, null, 2)
      await fs.writeFile(this.configPath, data, 'utf-8')
    } catch (error) {
      console.error('Failed to save app config:', error)
      throw new Error(
        `Failed to save app config: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private getDefaultConfig(): AppConfig {
    return {
      recentVaults: [],
      showVaultSelector: true,
      windowMode: 'normal',
      toggleSettings: {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
    }
  }

  private needsMigration(config: AppConfig): boolean {
    return config.enableCrossDesktopToggle !== undefined || config.windowMode === undefined
  }

  private migrateOldConfig(config: AppConfig): AppConfig {
    const migratedConfig = { ...config }

    // Migrate enableCrossDesktopToggle to new windowMode system
    if (config.enableCrossDesktopToggle !== undefined) {
      // If cross-desktop toggle was enabled, set to toggle mode with standard type
      migratedConfig.windowMode = config.enableCrossDesktopToggle ? 'toggle' : 'normal'
      migratedConfig.toggleSettings = {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
      // Remove the old field
      delete migratedConfig.enableCrossDesktopToggle
    }

    // Ensure windowMode is set
    if (!migratedConfig.windowMode) {
      migratedConfig.windowMode = 'normal'
    }

    // Ensure toggleSettings exist if in toggle mode
    if (migratedConfig.windowMode === 'toggle' && !migratedConfig.toggleSettings) {
      migratedConfig.toggleSettings = {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
    }

    return migratedConfig
  }
}
