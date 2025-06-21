import { IPCHandler, IPCContext } from '../types'
import { createAppHandlers } from './app-handlers'
import { createVaultHandlers } from './vault-handlers'

export function getAllIPCHandlers(context: IPCContext): IPCHandler[] {
  return [
    ...createAppHandlers(),
    ...createVaultHandlers(context)
  ]
}

export { createAppHandlers, createVaultHandlers }