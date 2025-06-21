import { promises as fs } from 'fs'
import { join } from 'path'
import { app } from 'electron'
import type { ShortcutConfig } from './types'
import { DEFAULT_GLOBAL_SHORTCUTS, DEFAULT_LOCAL_SHORTCUTS } from './default-shortcuts'

export interface ShortcutConfigData {
  version: string
  shortcuts: {
    global: ShortcutConfig[]
    local: ShortcutConfig[]
  }
  lastModified: string
}

export class ShortcutConfigManager {
  private configPath: string
  private config: ShortcutConfigData
  private defaultConfig: ShortcutConfigData

  constructor() {
    this.configPath = join(app.getPath('userData'), 'shortcuts.json')
    this.defaultConfig = this.createDefaultConfig()
    this.config = { ...this.defaultConfig }
  }

  private createDefaultConfig(): ShortcutConfigData {
    return {
      version: '1.0.0',
      lastModified: new Date().toISOString(),
      shortcuts: {
        global: DEFAULT_GLOBAL_SHORTCUTS,
        local: DEFAULT_LOCAL_SHORTCUTS
      }
    }
  }

  async loadConfig(): Promise<ShortcutConfigData> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8')
      const config = JSON.parse(data) as ShortcutConfigData

      // 버전 호환성 검사
      if (config.version !== this.defaultConfig.version) {
        console.log('Config version mismatch, migrating...')
        this.config = await this.migrateConfig(config)
      } else {
        this.config = config
      }

      return this.config
    } catch (error) {
      console.log('No existing config found, creating default config')
      this.config = { ...this.defaultConfig }
      await this.saveConfig()
      return this.config
    }
  }

  async saveConfig(): Promise<void> {
    try {
      this.config.lastModified = new Date().toISOString()
      const data = JSON.stringify(this.config, null, 2)
      await fs.writeFile(this.configPath, data, 'utf-8')
      console.log('Shortcut config saved')
    } catch (error) {
      console.error('Failed to save shortcut config:', error)
      throw error
    }
  }

  getGlobalShortcuts(): ShortcutConfig[] {
    return [...this.config.shortcuts.global]
  }

  getLocalShortcuts(): ShortcutConfig[] {
    return [...this.config.shortcuts.local]
  }

  getAllShortcuts(): ShortcutConfig[] {
    return [...this.config.shortcuts.global, ...this.config.shortcuts.local]
  }

  getShortcutsByCategory(category: string): ShortcutConfig[] {
    return this.getAllShortcuts().filter((shortcut) => shortcut.category === category)
  }

  updateGlobalShortcut(key: string, newConfig: Partial<ShortcutConfig>): boolean {
    const index = this.config.shortcuts.global.findIndex((s) => s.key === key)
    if (index === -1) return false

    this.config.shortcuts.global[index] = {
      ...this.config.shortcuts.global[index],
      ...newConfig
    }
    return true
  }

  updateLocalShortcut(key: string, newConfig: Partial<ShortcutConfig>): boolean {
    const index = this.config.shortcuts.local.findIndex((s) => s.key === key)
    if (index === -1) return false

    this.config.shortcuts.local[index] = {
      ...this.config.shortcuts.local[index],
      ...newConfig
    }
    return true
  }

  addGlobalShortcut(config: ShortcutConfig): boolean {
    // 중복 검사
    if (this.config.shortcuts.global.some((s) => s.key === config.key)) {
      return false
    }

    this.config.shortcuts.global.push(config)
    return true
  }

  addLocalShortcut(config: ShortcutConfig): boolean {
    // 중복 검사
    if (this.config.shortcuts.local.some((s) => s.key === config.key)) {
      return false
    }

    this.config.shortcuts.local.push(config)
    return true
  }

  removeGlobalShortcut(key: string): boolean {
    const index = this.config.shortcuts.global.findIndex((s) => s.key === key)
    if (index === -1) return false

    this.config.shortcuts.global.splice(index, 1)
    return true
  }

  removeLocalShortcut(key: string): boolean {
    const index = this.config.shortcuts.local.findIndex((s) => s.key === key)
    if (index === -1) return false

    this.config.shortcuts.local.splice(index, 1)
    return true
  }

  resetToDefault(): void {
    this.config = { ...this.defaultConfig }
  }

  hasConflict(key: string, type: 'global' | 'local'): boolean {
    const shortcuts = type === 'global' ? this.config.shortcuts.global : this.config.shortcuts.local

    return shortcuts.some((s) => s.key === key)
  }

  private async migrateConfig(oldConfig: ShortcutConfigData): Promise<ShortcutConfigData> {
    // 버전별 마이그레이션 로직
    const newConfig = { ...this.defaultConfig }

    // 기존 사용자 설정이 있다면 병합
    if (oldConfig.shortcuts) {
      // 기존 설정 유지하면서 새로운 기본값 추가
      newConfig.shortcuts.global = this.mergeShortcuts(
        oldConfig.shortcuts.global || [],
        newConfig.shortcuts.global
      )
      newConfig.shortcuts.local = this.mergeShortcuts(
        oldConfig.shortcuts.local || [],
        newConfig.shortcuts.local
      )
    }

    await this.saveConfig()
    return newConfig
  }

  private mergeShortcuts(existing: ShortcutConfig[], defaults: ShortcutConfig[]): ShortcutConfig[] {
    const merged = [...existing]

    // 기존에 없는 기본 설정만 추가
    defaults.forEach((defaultShortcut) => {
      if (!existing.some((s) => s.key === defaultShortcut.key)) {
        merged.push(defaultShortcut)
      }
    })

    return merged
  }
}
