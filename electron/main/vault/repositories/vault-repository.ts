import { promises as fs, constants } from 'fs'
import { join, resolve } from 'path'
import { VaultRepository, VaultValidationResult, VaultMetadata } from '../interfaces'
import { createWelcomeNoteContent } from '../templates/welcome-note'

export class FileVaultRepository implements VaultRepository {
  async validatePath(vaultPath: string): Promise<VaultValidationResult> {
    try {
      const resolvedPath = resolve(vaultPath)

      // 경로 접근 가능성 확인
      try {
        await fs.access(resolvedPath)
      } catch {
        return {
          isValid: false,
          isExisting: false,
          canWrite: false,
          error: 'Path does not exist or is not accessible'
        }
      }

      // 디렉토리 여부 확인
      const stats = await fs.stat(resolvedPath)
      if (!stats.isDirectory()) {
        return {
          isValid: false,
          isExisting: false,
          canWrite: false,
          error: 'Path is not a directory'
        }
      }

      // 쓰기 권한 확인
      try {
        await fs.access(resolvedPath, constants.W_OK)
      } catch {
        return {
          isValid: false,
          isExisting: true,
          canWrite: false,
          error: 'No write permission for this directory'
        }
      }

      // 기존 Vault 확인
      const metadata = await this.loadMetadata(resolvedPath)
      const isExisting = metadata !== null

      return {
        isValid: true,
        isExisting,
        canWrite: true,
        metadata: metadata || undefined
      }
    } catch (error) {
      return {
        isValid: false,
        isExisting: false,
        canWrite: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async loadMetadata(vaultPath: string): Promise<VaultMetadata | null> {
    try {
      const metadataPath = join(vaultPath, '.note', 'vault.json')
      const content = await fs.readFile(metadataPath, 'utf-8')
      return JSON.parse(content) as VaultMetadata
    } catch {
      return null
    }
  }

  async saveMetadata(vaultPath: string, metadata: VaultMetadata): Promise<void> {
    try {
      const configDir = join(vaultPath, '.note')
      await fs.mkdir(configDir, { recursive: true })

      const metadataPath = join(configDir, 'vault.json')
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8')
    } catch (error) {
      throw new Error(
        `Failed to save vault metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async createStructure(vaultPath: string, vaultName: string): Promise<void> {
    try {
      await this.createConfigStructure(vaultPath, vaultName)
      await this.createWorkspaceStructure(vaultPath)
      await this.createWelcomeNote(vaultPath, vaultName)
    } catch (error) {
      throw new Error(
        `Failed to create vault structure: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private async createConfigStructure(vaultPath: string, vaultName: string): Promise<void> {
    const configDir = join(vaultPath, '.note')
    await fs.mkdir(configDir, { recursive: true })

    // vault.json 메타데이터 생성
    const metadata: VaultMetadata = {
      version: '1.0.0',
      name: vaultName,
      description: `Notes vault: ${vaultName}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    await this.saveMetadata(vaultPath, metadata)

    // workspaces.json 초기화
    const initialWorkspaces = {
      workspaces: [
        {
          id: 'default',
          name: 'Personal',
          path: 'workspace-personal',
          createdAt: new Date().toISOString(),
          isDefault: true
        }
      ],
      activeWorkspace: 'default'
    }

    await fs.writeFile(
      join(configDir, 'workspaces.json'),
      JSON.stringify(initialWorkspaces, null, 2),
      'utf-8'
    )
  }

  private async createWorkspaceStructure(vaultPath: string): Promise<void> {
    const defaultWorkspacePath = join(vaultPath, 'workspace-personal')
    await fs.mkdir(defaultWorkspacePath, { recursive: true })

    // .workspace.json 생성
    const workspaceConfig = {
      id: 'default',
      name: 'Personal',
      description: 'Personal notes and ideas',
      channels: [
        {
          id: 'daily',
          name: 'Daily Notes',
          path: 'channel-daily',
          type: 'daily'
        },
        {
          id: 'ideas',
          name: 'Ideas',
          path: 'channel-ideas',
          type: 'notes'
        }
      ],
      createdAt: new Date().toISOString()
    }

    await fs.writeFile(
      join(defaultWorkspacePath, '.workspace.json'),
      JSON.stringify(workspaceConfig, null, 2),
      'utf-8'
    )

    // 기본 채널 디렉토리들 생성
    await fs.mkdir(join(defaultWorkspacePath, 'channel-daily'), { recursive: true })
    await fs.mkdir(join(defaultWorkspacePath, 'channel-ideas'), { recursive: true })
  }

  private async createWelcomeNote(vaultPath: string, vaultName: string): Promise<void> {
    const welcomeNoteContent = createWelcomeNoteContent(vaultName)
    const welcomeNotePath = join(vaultPath, 'workspace-personal', 'channel-ideas', 'welcome.md')
    await fs.writeFile(welcomeNotePath, welcomeNoteContent, 'utf-8')
  }
}
