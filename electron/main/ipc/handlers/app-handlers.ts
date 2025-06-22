import { app } from 'electron'
import type { IPCHandler } from '../types'
import { IPCPermissionLevel } from '../permissions/permission-types'
import { getCrossDesktopToggleEnabled, setCrossDesktopToggleEnabled } from '../../actions/global/toggle-mode-manager'

export function createAppHandlers(): IPCHandler[] {
  return [
    {
      channel: 'get-app-version',
      handler: (): string => {
        return app.getVersion()
      },
      permission: {
        level: IPCPermissionLevel.PUBLIC,
        description: 'Get application version'
      }
    },
    {
      channel: 'get-platform',
      handler: (): NodeJS.Platform => {
        return process.platform
      },
      permission: {
        level: IPCPermissionLevel.PUBLIC,
        description: 'Get platform information'
      }
    },
    {
      channel: 'get-cross-desktop-toggle-enabled',
      handler: async (): Promise<boolean> => {
        return await getCrossDesktopToggleEnabled()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Check if cross-desktop toggle mode is enabled'
      }
    },
    {
      channel: 'set-cross-desktop-toggle-enabled',
      handler: async (_, enabled: boolean): Promise<void> => {
        await setCrossDesktopToggleEnabled(enabled)
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Set cross-desktop toggle mode enabled state'
      }
    }
  ]
}
