import { BrowserWindow } from 'electron'

export enum IPCPermissionLevel {
  ROOT = 'root',           // Full system access - core app functionality
  PLUGIN = 'plugin',       // Limited access - external plugin functionality
  PUBLIC = 'public'        // Public access - no sensitive operations
}

export interface IPCPermission {
  level: IPCPermissionLevel
  description?: string
}

export interface PermissionContext {
  senderFrame: Electron.WebFrameMain
  sender: Electron.WebContents
  mainWindow: BrowserWindow | null
}

export interface IPCPermissionManager {
  setChannelPermission(channel: string, permission: IPCPermission): void
  checkPermission(channel: string, context: PermissionContext): Promise<boolean>
  getChannelPermission(channel: string): IPCPermission | undefined
  revokeChannelPermission(channel: string): void
  getAllPermissions(): Map<string, IPCPermission>
}

export class DefaultIPCPermissionManager implements IPCPermissionManager {
  private permissions = new Map<string, IPCPermission>()

  constructor() {
    this.initializeDefaultPermissions()
  }

  private initializeDefaultPermissions(): void {
    // Root level permissions - core app functionality
    this.setChannelPermission('vault:get-current', {
      level: IPCPermissionLevel.ROOT,
      description: 'Get current vault configuration'
    })
    
    this.setChannelPermission('vault:get-recent', {
      level: IPCPermissionLevel.ROOT,
      description: 'Get recent vault list'
    })
    
    this.setChannelPermission('vault:select', {
      level: IPCPermissionLevel.ROOT,
      description: 'Show vault selection dialog'
    })
    
    this.setChannelPermission('vault:set-current', {
      level: IPCPermissionLevel.ROOT,
      description: 'Set current vault'
    })
    
    this.setChannelPermission('vault:remove-recent', {
      level: IPCPermissionLevel.ROOT,
      description: 'Remove vault from recent list'
    })
    
    this.setChannelPermission('vault:should-show-selector', {
      level: IPCPermissionLevel.ROOT,
      description: 'Check if vault selector should be shown'
    })
    
    this.setChannelPermission('vault:set-show-selector', {
      level: IPCPermissionLevel.ROOT,
      description: 'Set vault selector visibility'
    })

    // Public level permissions - safe for general access
    this.setChannelPermission('get-app-version', {
      level: IPCPermissionLevel.PUBLIC,
      description: 'Get application version'
    })
    
    this.setChannelPermission('get-platform', {
      level: IPCPermissionLevel.PUBLIC,
      description: 'Get platform information'
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

  private checkPluginPermission(context: PermissionContext): boolean {
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