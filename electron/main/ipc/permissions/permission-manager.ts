import type { IPCPermissionManager, IPCPermission, PermissionContext } from './permission-types'
import { IPCPermissionLevel } from './permission-types'
import { DEFAULT_PERMISSIONS } from './default-permissions'

export class DefaultIPCPermissionManager implements IPCPermissionManager {
  private permissions = new Map<string, IPCPermission>()

  constructor() {
    this.initializeDefaultPermissions()
  }

  private initializeDefaultPermissions(): void {
    // Load default permissions from configuration
    Object.entries(DEFAULT_PERMISSIONS).forEach(([channel, permission]) => {
      this.setChannelPermission(channel, permission)
    })
  }

  setChannelPermission(channel: string, permission: IPCPermission): void {
    this.permissions.set(channel, permission)
  }

  async checkPermission(channel: string, context: PermissionContext): Promise<boolean> {
    const permission = this.permissions.get(channel)

    // If no permission is set, default to ROOT level (restrictive)
    if (!permission) {
      console.warn(`No permission configured for channel: ${channel}. Defaulting to ROOT level.`)
      return this.isMainWindow(context)
    }

    // Check permission level
    switch (permission.level) {
      case IPCPermissionLevel.PUBLIC:
        return true

      case IPCPermissionLevel.PLUGIN:
        return this.checkPluginPermission(context)

      case IPCPermissionLevel.ROOT:
        return this.checkRootPermission(context)

      default:
        console.error(`Unknown permission level: ${permission.level}`)
        return false
    }
  }

  private checkPluginPermission(_context: PermissionContext): boolean {
    // Plugin level: allow if not from main window (plugin context)
    // This can be extended with more sophisticated plugin validation
    return true
  }

  private checkRootPermission(context: PermissionContext): boolean {
    // Root level: only allow from main window
    return this.isMainWindow(context)
  }

  private isMainWindow(context: PermissionContext): boolean {
    if (!context.mainWindow) {
      return false
    }

    return context.sender === context.mainWindow.webContents
  }

  getChannelPermission(channel: string): IPCPermission | undefined {
    return this.permissions.get(channel)
  }

  revokeChannelPermission(channel: string): void {
    this.permissions.delete(channel)
  }

  getAllPermissions(): Map<string, IPCPermission> {
    return new Map(this.permissions)
  }

  // Plugin management methods
  addPluginChannel(channel: string, description?: string): void {
    this.setChannelPermission(channel, {
      level: IPCPermissionLevel.PLUGIN,
      description: description || `Plugin channel: ${channel}`
    })
  }

  removePluginChannel(channel: string): void {
    const permission = this.permissions.get(channel)
    if (permission && permission.level === IPCPermissionLevel.PLUGIN) {
      this.revokeChannelPermission(channel)
    }
  }

  // Utility method to get all channels by permission level
  getChannelsByLevel(level: IPCPermissionLevel): string[] {
    const channels: string[] = []
    for (const [channel, permission] of this.permissions) {
      if (permission.level === level) {
        channels.push(channel)
      }
    }
    return channels
  }
}

// Singleton instance
let permissionManager: IPCPermissionManager | null = null

export function getPermissionManager(): IPCPermissionManager {
  if (!permissionManager) {
    permissionManager = new DefaultIPCPermissionManager()
  }
  return permissionManager
}
