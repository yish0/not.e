import { DefaultIPCManager } from './core/ipc-manager'
import type { IPCManager, IPCContext } from './types'
import { createAppHandlers } from './handlers/app-handlers'
import { createVaultHandlers } from './handlers/vault-handlers'

function getAllIPCHandlers(context: IPCContext) {
  return [...createAppHandlers(), ...createVaultHandlers(context)]
}

// Singleton instance
let ipcManagerInstance: IPCManager | null = null

export function getIPCManager(): IPCManager {
  if (!ipcManagerInstance) {
    ipcManagerInstance = new DefaultIPCManager()
  }
  return ipcManagerInstance
}

export function setupIPCHandlers(context: IPCContext): void {
  const ipcManager = getIPCManager()
  const handlers = getAllIPCHandlers(context)
  ipcManager.registerHandlers(handlers)
  console.log(`Registered ${handlers.length} IPC handlers`)
}

export function resetIPCManager(): void {
  if (ipcManagerInstance) {
    ipcManagerInstance.unregisterAll()
    ipcManagerInstance = null
  }
}

// Type exports
export type { IPCHandler, IPCManager, IPCContext } from './types'

// Re-exports
export { DefaultIPCManager } from './core/ipc-manager'
