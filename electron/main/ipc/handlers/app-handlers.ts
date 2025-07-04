import { app } from 'electron'
import type { IPCHandler } from '../types'
import { IPCPermissionLevel } from '../permissions/permission-types'
import type { AppConfig, ToggleSettings } from '../../vault/types/vault-types'
import {
  getWindowMode,
  setWindowMode,
  getToggleSettings,
  setToggleSettings,
  getAppConfig,
  // Legacy functions for backward compatibility
  getCrossDesktopToggleEnabled,
  setCrossDesktopToggleEnabled
} from '../../core/window/toggle-mode-manager'

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
      channel: 'get-window-mode',
      handler: async (): Promise<'normal' | 'toggle'> => {
        return await getWindowMode()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Get current window mode'
      }
    },
    {
      channel: 'set-window-mode',
      handler: async (_, mode: 'normal' | 'toggle'): Promise<void> => {
        await setWindowMode(mode)
        // TODO: Trigger shortcut system reinitialization
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Set window mode'
      }
    },
    {
      channel: 'get-toggle-settings',
      handler: async (): Promise<ToggleSettings> => {
        return await getToggleSettings()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Get current toggle settings'
      }
    },
    {
      channel: 'set-toggle-settings',
      handler: async (_, settings: ToggleSettings): Promise<void> => {
        await setToggleSettings(settings)
        // TODO: Trigger shortcut system reinitialization
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Update toggle settings'
      }
    },
    {
      channel: 'get-app-config',
      handler: async (): Promise<AppConfig> => {
        return await getAppConfig()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Get complete app configuration'
      }
    },
    // Legacy handlers for backward compatibility
    {
      channel: 'get-cross-desktop-toggle-enabled',
      handler: async (): Promise<boolean> => {
        return await getCrossDesktopToggleEnabled()
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Check if cross-desktop toggle mode is enabled (deprecated)'
      }
    },
    {
      channel: 'set-cross-desktop-toggle-enabled',
      handler: async (_, enabled: boolean): Promise<void> => {
        await setCrossDesktopToggleEnabled(enabled)
        // TODO: Trigger shortcut system reinitialization
      },
      permission: {
        level: IPCPermissionLevel.ROOT,
        description: 'Set cross-desktop toggle mode enabled state (deprecated)'
      }
    }
  ]
}
