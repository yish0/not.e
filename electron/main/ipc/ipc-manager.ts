import { ipcMain, BrowserWindow } from 'electron'
import { IPCManager, IPCHandler } from './types'
import { getPermissionManager, PermissionContext } from './permission-manager'

export class DefaultIPCManager implements IPCManager {
  private registeredChannels: Set<string> = new Set()
  private mainWindow: BrowserWindow | null = null

  constructor(mainWindow?: BrowserWindow | null) {
    this.mainWindow = mainWindow || null
  }

  setMainWindow(mainWindow: BrowserWindow | null): void {
    this.mainWindow = mainWindow
  }

  registerHandler(handler: IPCHandler): void {
    if (this.registeredChannels.has(handler.channel)) {
      console.warn(`IPC handler for channel '${handler.channel}' is already registered`)
      return
    }

    const permissionManager = getPermissionManager()
    
    // Register permission if provided in handler
    if (handler.permission) {
      permissionManager.setChannelPermission(handler.channel, handler.permission)
    }

    // Wrap handler with permission check
    const wrappedHandler = async (event: Electron.IpcMainInvokeEvent, ...args: any[]) => {
      const context: PermissionContext = {
        senderFrame: event.senderFrame,
        sender: event.sender,
        mainWindow: this.mainWindow
      }

      const hasPermission = await permissionManager.checkPermission(handler.channel, context)
      
      if (!hasPermission) {
        console.error(`Permission denied for IPC channel: ${handler.channel}`)
        throw new Error(`Permission denied for channel: ${handler.channel}`)
      }

      return handler.handler(event, ...args)
    }

    ipcMain.handle(handler.channel, wrappedHandler)
    this.registeredChannels.add(handler.channel)
    console.log(`IPC handler registered: ${handler.channel}`)
  }

  registerHandlers(handlers: IPCHandler[]): void {
    handlers.forEach(handler => this.registerHandler(handler))
  }

  unregisterHandler(channel: string): void {
    if (this.registeredChannels.has(channel)) {
      ipcMain.removeHandler(channel)
      this.registeredChannels.delete(channel)
      console.log(`IPC handler unregistered: ${channel}`)
    }
  }

  unregisterAll(): void {
    this.registeredChannels.forEach(channel => {
      ipcMain.removeHandler(channel)
    })
    this.registeredChannels.clear()
    console.log('All IPC handlers unregistered')
  }

  getRegisteredChannels(): string[] {
    return Array.from(this.registeredChannels)
  }
}