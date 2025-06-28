import { promises as fs } from 'fs'
import type { VaultSelectionConfig, VaultSelectionConfigRepository } from '../types/vault-types'
import { GlobalAppPaths } from '../../../config/vault-paths'

export class FileVaultSelectionConfigRepository implements VaultSelectionConfigRepository {
  getPath(): string {
    return GlobalAppPaths.getVaultSelectionPath()
  }

  private async ensureConfigDirectory(): Promise<void> {
    const configDir = GlobalAppPaths.getGlobalAppDir()
    try {
      await fs.mkdir(configDir, { recursive: true })
    } catch (error) {
      console.error('Failed to create global app config directory:', error)
      throw new Error(
        `Failed to create global app config directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async load(): Promise<VaultSelectionConfig> {
    const configPath = this.getPath()
    try {
      const data = await fs.readFile(configPath, 'utf-8')
      const rawConfig = JSON.parse(data) as VaultSelectionConfig
      const config = { ...this.getDefaultConfig(), ...rawConfig }

      return config
    } catch (error) {
      console.log('No existing vault selection config found, using defaults')
      const defaultConfig = this.getDefaultConfig()
      await this.save(defaultConfig)
      return defaultConfig
    }
  }

  async save(config: VaultSelectionConfig): Promise<void> {
    try {
      await this.ensureConfigDirectory()
      const configPath = this.getPath()
      const data = JSON.stringify(config, null, 2)
      await fs.writeFile(configPath, data, 'utf-8')
    } catch (error) {
      console.error('Failed to save vault selection config:', error)
      throw new Error(
        `Failed to save vault selection config: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private getDefaultConfig(): VaultSelectionConfig {
    return {
      recentVaults: [],
      showVaultSelector: true
    }
  }
}