import { app } from 'electron'
import type { IPCHandler } from '../types'
import { IPCPermissionLevel } from '../permissions/permission-types'

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
    }
  ]
}
