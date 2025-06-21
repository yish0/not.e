import { resolve, basename } from 'path'
import {
  VaultInitializerService,
  VaultRepository,
  VaultInitResult,
  VaultValidationResult,
  VaultConfig
} from '../interfaces'

export class DefaultVaultInitializerService implements VaultInitializerService {
  constructor(private vaultRepository: VaultRepository) {}

  async validate(vaultPath: string): Promise<VaultValidationResult> {
    return await this.vaultRepository.validatePath(vaultPath)
  }

  async initialize(vaultPath: string, vaultName?: string): Promise<VaultInitResult> {
    try {
      const validation = await this.validate(vaultPath)

      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }

      const resolvedPath = resolve(vaultPath)
      const defaultName = vaultName || basename(resolvedPath)

      let vault: VaultConfig
      let isNewVault = false

      if (validation.isExisting && validation.metadata) {
        // 기존 Vault 로드
        vault = {
          path: resolvedPath,
          name: validation.metadata.name || defaultName,
          createdAt: validation.metadata.createdAt,
          lastAccessed: new Date().toISOString()
        }
      } else {
        // 새 Vault 생성
        isNewVault = true
        vault = {
          path: resolvedPath,
          name: defaultName,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        }

        // Vault 구조 생성
        await this.vaultRepository.createStructure(resolvedPath, vault.name)
      }

      return { success: true, vault, isNewVault }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize vault'
      }
    }
  }
}
