import { app } from 'electron'
import { IPCHandler } from '../types'

export function createAppHandlers(): IPCHandler[] {
  return [
    {
      channel: 'get-app-version',
      handler: (): string => {
        return app.getVersion()
      }
    },
    {
      channel: 'get-platform',
      handler: (): NodeJS.Platform => {
        return process.platform
      }
    }
  ]
}