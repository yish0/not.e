import { BrowserWindow } from 'electron'

export enum IPCPermissionLevel {
  ROOT = 'root', // Full system access - core app functionality
  PLUGIN = 'plugin', // Limited access - external plugin functionality
  PUBLIC = 'public' // Public access - no sensitive operations
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
