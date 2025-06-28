/**
 * Centralized Application and Vault Directory and File Constants
 *
 * This module provides all directory names and file names used in the application
 * including both global app settings and vault-specific configurations.
 */

/**
 * Global application directories (stored in user home directory)
 */
export const GLOBAL_APP_DIRECTORIES = {
  /** Global app configuration directory in user home (~/.not.e) */
  ROOT: '.not.e'
} as const

/**
 * Directory names used within vaults
 */
export const VAULT_DIRECTORIES = {
  /** Directory for vault metadata and configuration (.note) */
  METADATA: '.note',
  /** Directory for vault-specific app settings (.not.e) */
  APP_CONFIG: '.not.e',
  /** Default workspace directory names */
  WORKSPACES: {
    PERSONAL: 'workspace-personal',
    DEVELOPMENT: 'workspace-development'
  }
} as const

/**
 * File names used in global application directory (~/.not.e)
 */
export const GLOBAL_APP_FILES = {
  /** Global application settings */
  APP_CONFIG: {
    PRODUCTION: 'app-config.json',
    DEVELOPMENT: 'app-config.dev.json'
  },
  /** Vault selection and recent vaults list */
  VAULT_SELECTION: 'vault-selection.json',
  /** Global shortcut configurations */
  SHORTCUTS: 'shortcuts.json'
} as const

/**
 * File names used within vault directories
 */
export const VAULT_FILES = {
  /** Vault metadata file (stored in .note directory) */
  VAULT_METADATA: 'vault.json',
  /** Workspace configuration file (stored in .note directory) */
  WORKSPACES_CONFIG: 'workspaces.json',
  /** Vault-specific application settings file (stored in vault/.not.e directory) */
  APP_CONFIG: {
    PRODUCTION: 'vault-app-config.json',
    DEVELOPMENT: 'vault-app-config.dev.json'
  },
  /** Vault-specific shortcut overrides */
  SHORTCUTS: 'vault-shortcuts.json',
  /** Welcome note file name */
  WELCOME_NOTE: 'Welcome.md'
} as const

/**
 * Type definitions for configuration
 */
export type GlobalAppDirectoryName =
  (typeof GLOBAL_APP_DIRECTORIES)[keyof typeof GLOBAL_APP_DIRECTORIES]
export type GlobalAppFileName = (typeof GLOBAL_APP_FILES)[keyof typeof GLOBAL_APP_FILES]
export type VaultDirectoryName = (typeof VAULT_DIRECTORIES)[keyof typeof VAULT_DIRECTORIES]
export type VaultFileName = (typeof VAULT_FILES)[keyof typeof VAULT_FILES]
