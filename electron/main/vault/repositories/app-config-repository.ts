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
      const config = JSON.parse(data) as AppConfig
      return { ...this.getDefaultConfig(), ...config }
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
      showVaultSelector: true
    }
  }
}
