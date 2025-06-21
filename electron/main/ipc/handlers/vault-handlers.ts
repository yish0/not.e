import { getVaultManager } from '../../vault'
import { IPCHandler, IPCContext } from '../types'

export function createVaultHandlers(context: IPCContext): IPCHandler[] {
  const vaultManager = getVaultManager()

  return [
    {
      channel: 'vault:get-current',
      handler: async () => {
        return await vaultManager.getCurrentVault()
      }
    },
    {
      channel: 'vault:get-recent',
      handler: async () => {
        return await vaultManager.getRecentVaults()
      }
    },
    {
      channel: 'vault:select',
      handler: async () => {
        return await vaultManager.showVaultSelectionDialog(context.mainWindow || undefined)
      }
    },
    {
      channel: 'vault:set-current',
      handler: async (_, vaultPath: string) => {
        return await vaultManager.setCurrentVault(vaultPath)
      }
    },
    {
      channel: 'vault:remove-recent',
      handler: async (_, vaultPath: string) => {
        await vaultManager.removeVaultFromRecent(vaultPath)
        return { success: true }
      }
    },
    {
      channel: 'vault:should-show-selector',
      handler: () => {
        return vaultManager.shouldShowVaultSelector()
      }
    },
    {
      channel: 'vault:set-show-selector',
      handler: async (_, show: boolean) => {
        await vaultManager.setShowVaultSelector(show)
        return { success: true }
      }
    }
  ]
}