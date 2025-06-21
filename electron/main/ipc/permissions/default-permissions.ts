import type { IPCPermission } from './permission-types'
import { IPCPermissionLevel } from './permission-types'

// Default permission configurations for all IPC channels
export const DEFAULT_PERMISSIONS: Record<string, IPCPermission> = {
  // Root level permissions - core app functionality
  'vault:get-current': {
    level: IPCPermissionLevel.ROOT,
    description: 'Get current vault configuration'
  },
  'vault:get-recent': {
    level: IPCPermissionLevel.ROOT,
    description: 'Get recent vault list'
  },
  'vault:select': {
    level: IPCPermissionLevel.ROOT,
    description: 'Show vault selection dialog'
  },
  'vault:set-current': {
    level: IPCPermissionLevel.ROOT,
    description: 'Set current vault'
  },
  'vault:remove-recent': {
    level: IPCPermissionLevel.ROOT,
    description: 'Remove vault from recent list'
  },
  'vault:should-show-selector': {
    level: IPCPermissionLevel.ROOT,
    description: 'Check if vault selector should be shown'
  },
  'vault:set-show-selector': {
    level: IPCPermissionLevel.ROOT,
    description: 'Set vault selector visibility'
  },

  // Public level permissions - safe for general access
  'get-app-version': {
    level: IPCPermissionLevel.PUBLIC,
    description: 'Get application version'
  },
  'get-platform': {
    level: IPCPermissionLevel.PUBLIC,
    description: 'Get platform information'
  }
}
