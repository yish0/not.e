/**
 * Application and Vault Path Utility Classes and Functions
 *
 * This module provides path utilities for both global app settings and vault system.
 */

import { join } from 'path'
import { app } from 'electron'
import { isDev } from '../config'
import {
  GLOBAL_APP_DIRECTORIES,
  GLOBAL_APP_FILES,
  VAULT_DIRECTORIES,
  VAULT_FILES
} from './vault-constants'

/**
 * Global application paths utility class
 */
export class GlobalAppPaths {
  /**
   * Get the global app directory path (~/.not.e)
   */
  static getGlobalAppDir(): string {
    return join(app.getPath('home'), GLOBAL_APP_DIRECTORIES.ROOT)
  }

  /**
   * Get global app configuration file path
   */
  static getGlobalAppConfigPath(): string {
    const configFileName = isDev
      ? GLOBAL_APP_FILES.APP_CONFIG.DEVELOPMENT
      : GLOBAL_APP_FILES.APP_CONFIG.PRODUCTION
    return join(this.getGlobalAppDir(), configFileName)
  }

  /**
   * Get vault selection configuration file path
   */
  static getVaultSelectionPath(): string {
    return join(this.getGlobalAppDir(), GLOBAL_APP_FILES.VAULT_SELECTION)
  }

  /**
   * Get global shortcuts configuration file path
   */
  static getGlobalShortcutsPath(): string {
    return join(this.getGlobalAppDir(), GLOBAL_APP_FILES.SHORTCUTS)
  }
}

/**
 * Path utility class for vault directory structure
 */
export class VaultPaths {
  constructor(private readonly vaultPath: string) {}

  /**
   * Get the metadata directory path (.note)
   */
  getMetadataDir(): string {
    return join(this.vaultPath, VAULT_DIRECTORIES.METADATA)
  }

  /**
   * Get the app config directory path (.not.e)
   */
  getAppConfigDir(): string {
    return join(this.vaultPath, VAULT_DIRECTORIES.APP_CONFIG)
  }

  /**
   * Get the vault metadata file path
   */
  getVaultMetadataPath(): string {
    return join(this.getMetadataDir(), VAULT_FILES.VAULT_METADATA)
  }

  /**
   * Get the workspaces configuration file path
   */
  getWorkspacesConfigPath(): string {
    return join(this.getMetadataDir(), VAULT_FILES.WORKSPACES_CONFIG)
  }

  /**
   * Get the vault-specific app configuration file path (environment-aware)
   */
  getVaultAppConfigPath(): string {
    const configFileName = isDev
      ? VAULT_FILES.APP_CONFIG.DEVELOPMENT
      : VAULT_FILES.APP_CONFIG.PRODUCTION
    return join(this.getAppConfigDir(), configFileName)
  }

  /**
   * Get the vault-specific shortcuts file path
   */
  getVaultShortcutsPath(): string {
    return join(this.getAppConfigDir(), VAULT_FILES.SHORTCUTS)
  }

  /**
   * Get workspace directory path
   */
  getWorkspacePath(workspaceName: string): string {
    return join(this.vaultPath, workspaceName)
  }

  /**
   * Get welcome note file path
   */
  getWelcomeNotePath(): string {
    return join(this.vaultPath, VAULT_FILES.WELCOME_NOTE)
  }

  /**
   * Get the vault root path
   */
  getVaultRoot(): string {
    return this.vaultPath
  }
}

/**
 * Static utility functions for path operations
 */
export const VaultPathUtils = {
  /**
   * Create a VaultPaths instance for the given vault path
   */
  forVault(vaultPath: string): VaultPaths {
    return new VaultPaths(vaultPath)
  },

  /**
   * Get metadata directory path for any vault
   */
  getMetadataDir(vaultPath: string): string {
    return join(vaultPath, VAULT_DIRECTORIES.METADATA)
  },

  /**
   * Get app config directory path for any vault
   */
  getAppConfigDir(vaultPath: string): string {
    return join(vaultPath, VAULT_DIRECTORIES.APP_CONFIG)
  },

  /**
   * Get vault metadata file path for any vault
   */
  getVaultMetadataPath(vaultPath: string): string {
    return join(vaultPath, VAULT_DIRECTORIES.METADATA, VAULT_FILES.VAULT_METADATA)
  },

  /**
   * Get vault-specific app config file path for any vault (environment-aware)
   */
  getVaultAppConfigPath(vaultPath: string): string {
    const configFileName = isDev
      ? VAULT_FILES.APP_CONFIG.DEVELOPMENT
      : VAULT_FILES.APP_CONFIG.PRODUCTION
    return join(vaultPath, VAULT_DIRECTORIES.APP_CONFIG, configFileName)
  },

  /**
   * @deprecated Use getVaultAppConfigPath instead for clarity
   */
  getAppConfigPath(vaultPath: string): string {
    return this.getVaultAppConfigPath(vaultPath)
  }
}
