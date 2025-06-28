import { promises as fs } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import type { VaultSelectionConfig, VaultSelectionConfigRepository } from '../types/vault-types'
import { isDev } from '../../../config'

export class FileVaultSelectionConfigRepository implements VaultSelectionConfigRepository {
  private configPath: string

  constructor() {
    this.configPath = this.getConfigPath()
  }

  private getConfigPath(): string {
    // 개발 모드에서는 프로젝트 루트의 .dev-config 디렉토리 사용
    if (isDev) {
      const { join: pathJoin } = require('path')
      const projectRoot = pathJoin(__dirname, '../../../../..')
      const devConfigDir = pathJoin(projectRoot, '.dev-config')
      return pathJoin(devConfigDir, 'vault-selection.json')
    }
    
    // 프로덕션에서는 기존 userData 디렉토리 사용
    return join(app.getPath('userData'), 'vault-selection.json')
  }

  private async ensureConfigDirectory(): Promise<void> {
    if (isDev) {
      const { dirname } = require('path')
      const configDir = dirname(this.configPath)
      try {
        await fs.mkdir(configDir, { recursive: true })
      } catch (error) {
        console.error('Failed to create dev config directory:', error)
        throw new Error(
          `Failed to create dev config directory: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
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
      await this.ensureConfigDirectory()
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