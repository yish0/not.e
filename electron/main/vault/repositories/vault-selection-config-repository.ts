import { promises as fs } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import type { VaultSelectionConfig, VaultSelectionConfigRepository } from '../types/vault-types'

export class FileVaultSelectionConfigRepository implements VaultSelectionConfigRepository {
  private configPath: string

  constructor() {
    this.configPath = join(app.getPath('userData'), 'vault-selection.json')
  }

  getPath(): string {
    return this.configPath
  }

  async load(): Promise<VaultSelectionConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8')
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
      const data = JSON.stringify(config, null, 2)
      await fs.writeFile(this.configPath, data, 'utf-8')
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