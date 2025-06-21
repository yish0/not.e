import { ipcMain } from 'electron'
import { IPCManager, IPCHandler } from './types'

export class DefaultIPCManager implements IPCManager {
  private registeredChannels: Set<string> = new Set()

  registerHandler(handler: IPCHandler): void {
    if (this.registeredChannels.has(handler.channel)) {
      console.warn(`IPC handler for channel '${handler.channel}' is already registered`)
      return
    }

    ipcMain.handle(handler.channel, handler.handler)
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