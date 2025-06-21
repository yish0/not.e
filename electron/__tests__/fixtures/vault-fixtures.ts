import {
  VaultConfig,
  VaultMetadata,
  WorkspaceConfig,
  ChannelConfig
} from '../../main/vault/interfaces'

export const mockVaultConfig: VaultConfig = {
  path: '/tmp/test-vault',
  name: 'Test Vault',
  createdAt: '2024-01-15T10:00:00.000Z',
  lastAccessed: '2024-01-16T09:30:00.000Z',
  isDefault: true
}

export const mockVaultMetadata: VaultMetadata = {
  version: '1.0.0',
  name: 'Test Vault',
  description: 'Test vault for unit testing',
  createdAt: '2024-01-15T10:00:00.000Z',
  lastModified: '2024-01-16T09:30:00.000Z'
}

export const mockChannelConfig: ChannelConfig = {
  id: 'test-channel',
  name: 'Test Channel',
  path: 'channel-test',
  type: 'notes'
}

export const mockWorkspaceConfig: WorkspaceConfig = {
  id: 'test-workspace',
  name: 'Test Workspace',
  description: 'Test workspace for unit testing',
  channels: [mockChannelConfig],
  createdAt: '2024-01-15T10:00:00.000Z'
}

export const mockAppConfig = {
  currentVault: '/tmp/test-vault',
  recentVaults: [mockVaultConfig],
  showVaultSelector: false,
  lastUsedVault: '/tmp/test-vault'
}

export const createTempPath = (suffix: string = ''): string => {
  return `/tmp/not-e-test${suffix ? `-${suffix}` : ''}`
}
