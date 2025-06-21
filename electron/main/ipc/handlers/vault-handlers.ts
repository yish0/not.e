import { getVaultManager } from '../../vault'
import { IPCHandler, IPCContext } from '../types'
import { IPCPermissionLevel } from '../permission-manager'

export function createVaultHandlers(context: IPCContext): IPCHandler[] {
  const vaultManager = getVaultManager()

  return [
    {
      channel: 'vault:get-current',
      handler: async () => {
        return await vaultManager.getCurrentVault()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Get current vault configuration'
      }
    },
    {
      channel: 'vault:get-recent',
      handler: async () => {
        return await vaultManager.getRecentVaults()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Get recent vault list'
      }
    },
    {
      channel: 'vault:select',
      handler: async () => {
        return await vaultManager.showVaultSelectionDialog(context.mainWindow || undefined)
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Show vault selection dialog'
      }
    },
    {
      channel: 'vault:set-current',
      handler: async (_, vaultPath: string) => {
        return await vaultManager.setCurrentVault(vaultPath)
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Set current vault'
      }
    },
    {
      channel: 'vault:remove-recent',
      handler: async (_, vaultPath: string) => {
        await vaultManager.removeVaultFromRecent(vaultPath)
        return { success: true }
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Remove vault from recent list'
      }
    },
    {
      channel: 'vault:should-show-selector',
      handler: () => {
        return vaultManager.shouldShowVaultSelector()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Check if vault selector should be shown'
      }
    },
    {
      channel: 'vault:set-show-selector',
      handler: async (_, show: boolean) => {
        await vaultManager.setShowVaultSelector(show)
        return { success: true }
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Set vault selector visibility'
      }
    }
  ]
}
