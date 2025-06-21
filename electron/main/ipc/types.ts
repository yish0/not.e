import { BrowserWindow } from 'electron'

export interface IPCHandler {
  channel: string
  handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any
}

export interface IPCManager {
  registerHandler(handler: IPCHandler): void
  registerHandlers(handlers: IPCHandler[]): void
  unregisterHandler(channel: string): void
  unregisterAll(): void
}

export interface IPCContext {
  mainWindow: BrowserWindow | null
}