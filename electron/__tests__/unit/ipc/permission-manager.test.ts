import { BrowserWindow } from 'electron'
import {
  DefaultIPCPermissionManager,
  IPCPermissionLevel,
  PermissionContext
} from '../../../main/ipc/permission-manager'

jest.mock('electron', () => ({
  BrowserWindow: jest.fn()
}))

describe('DefaultIPCPermissionManager', () => {
  let permissionManager: DefaultIPCPermissionManager
  let mockMainWindow: jest.Mocked<BrowserWindow>
  let mockWebContents: any
  let mockSenderFrame: any

  beforeEach(() => {
    permissionManager = new DefaultIPCPermissionManager()
    mockMainWindow = new BrowserWindow() as jest.Mocked<BrowserWindow>
    mockWebContents = { id: 1 }
    mockSenderFrame = { url: 'file://test' }
    mockMainWindow.webContents = mockWebContents
  })

  describe('Permission Level Checks', () => {
    it('should allow PUBLIC level from any context', async () => {
      const context: PermissionContext = {
        senderFrame: mockSenderFrame,
        sender: { id: 999 } as any,
        mainWindow: mockMainWindow
      }

      permissionManager.setChannelPermission('test-public', {
        level: IPCPermissionLevel.PUBLIC,
        description: 'Test public channel'
      })

      const hasPermission = await permissionManager.checkPermission('test-public', context)
      expect(hasPermission).toBe(true)
    })

    it('should allow ROOT level only from main window', async () => {
      const contextFromMain: PermissionContext = {
        senderFrame: mockSenderFrame,
        sender: mockWebContents,
        mainWindow: mockMainWindow
      }

      const contextFromOther: PermissionContext = {
        senderFrame: mockSenderFrame,
        sender: { id: 999 } as any,
        mainWindow: mockMainWindow
      }

      permissionManager.setChannelPermission('test-root', {
        level: IPCPermissionLevel.ROOT,
        description: 'Test root channel'
      })

      const hasPermissionFromMain = await permissionManager.checkPermission(
        'test-root',
        contextFromMain
      )
      const hasPermissionFromOther = await permissionManager.checkPermission(
        'test-root',
        contextFromOther
      )

      expect(hasPermissionFromMain).toBe(true)
      expect(hasPermissionFromOther).toBe(false)
    })

    it('should allow PLUGIN level from any context', async () => {
      const context: PermissionContext = {
        senderFrame: mockSenderFrame,
        sender: { id: 999 } as any,
        mainWindow: mockMainWindow
      }

      permissionManager.setChannelPermission('test-plugin', {
        level: IPCPermissionLevel.PLUGIN,
        description: 'Test plugin channel'
      })

      const hasPermission = await permissionManager.checkPermission('test-plugin', context)
      expect(hasPermission).toBe(true)
    })

    it('should default to ROOT level for unregistered channels', async () => {
      const contextFromMain: PermissionContext = {
        senderFrame: mockSenderFrame,
        sender: mockWebContents,
        mainWindow: mockMainWindow
      }

      const contextFromOther: PermissionContext = {
        senderFrame: mockSenderFrame,
        sender: { id: 999 } as any,
        mainWindow: mockMainWindow
      }

      const hasPermissionFromMain = await permissionManager.checkPermission(
        'unregistered-channel',
        contextFromMain
      )
      const hasPermissionFromOther = await permissionManager.checkPermission(
        'unregistered-channel',
        contextFromOther
      )

      expect(hasPermissionFromMain).toBe(true)
      expect(hasPermissionFromOther).toBe(false)
    })
  })

  describe('Default Permissions', () => {
    it('should have ROOT permissions for vault channels', () => {
      const vaultChannels = [
        'vault:get-current',
        'vault:get-recent',
        'vault:select',
        'vault:set-current',
        'vault:remove-recent',
        'vault:should-show-selector',
        'vault:set-show-selector'
      ]

      vaultChannels.forEach((channel) => {
        const permission = permissionManager.getChannelPermission(channel)
        expect(permission).toBeDefined()
        expect(permission?.level).toBe(IPCPermissionLevel.ROOT)
      })
    })

    it('should have PUBLIC permissions for app info channels', () => {
      const appChannels = ['get-app-version', 'get-platform']

      appChannels.forEach((channel) => {
        const permission = permissionManager.getChannelPermission(channel)
        expect(permission).toBeDefined()
        expect(permission?.level).toBe(IPCPermissionLevel.PUBLIC)
      })
    })
  })

  describe('Plugin Management', () => {
    it('should add plugin channels with PLUGIN level', () => {
      permissionManager.addPluginChannel('plugin:test-feature', 'Test plugin feature')

      const permission = permissionManager.getChannelPermission('plugin:test-feature')
      expect(permission).toBeDefined()
      expect(permission?.level).toBe(IPCPermissionLevel.PLUGIN)
      expect(permission?.description).toBe('Test plugin feature')
    })

    it('should remove plugin channels', () => {
      permissionManager.addPluginChannel('plugin:to-remove', 'To be removed')

      expect(permissionManager.getChannelPermission('plugin:to-remove')).toBeDefined()

      permissionManager.removePluginChannel('plugin:to-remove')

      expect(permissionManager.getChannelPermission('plugin:to-remove')).toBeUndefined()
    })

    it('should not remove non-plugin channels with removePluginChannel', () => {
      permissionManager.setChannelPermission('root:test', {
        level: IPCPermissionLevel.ROOT,
        description: 'Root test'
      })

      permissionManager.removePluginChannel('root:test')

      expect(permissionManager.getChannelPermission('root:test')).toBeDefined()
    })
  })

  describe('Utility Methods', () => {
    it('should get channels by permission level', () => {
      const rootChannels = permissionManager.getChannelsByLevel(IPCPermissionLevel.ROOT)
      const publicChannels = permissionManager.getChannelsByLevel(IPCPermissionLevel.PUBLIC)
      const pluginChannels = permissionManager.getChannelsByLevel(IPCPermissionLevel.PLUGIN)

      expect(rootChannels.length).toBeGreaterThan(0)
      expect(publicChannels.length).toBeGreaterThan(0)
      expect(pluginChannels.length).toBe(0) // No plugin channels by default

      permissionManager.addPluginChannel('plugin:test')
      const updatedPluginChannels = permissionManager.getChannelsByLevel(IPCPermissionLevel.PLUGIN)
      expect(updatedPluginChannels).toContain('plugin:test')
    })

    it('should revoke channel permissions', () => {
      permissionManager.setChannelPermission('test:revoke', {
        level: IPCPermissionLevel.PUBLIC,
        description: 'To be revoked'
      })

      expect(permissionManager.getChannelPermission('test:revoke')).toBeDefined()

      permissionManager.revokeChannelPermission('test:revoke')

      expect(permissionManager.getChannelPermission('test:revoke')).toBeUndefined()
    })

    it('should get all permissions', () => {
      const allPermissions = permissionManager.getAllPermissions()

      expect(allPermissions.size).toBeGreaterThan(0)
      expect(allPermissions.has('vault:get-current')).toBe(true)
      expect(allPermissions.has('get-app-version')).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null mainWindow', async () => {
      const context: PermissionContext = {
        senderFrame: mockSenderFrame,
        sender: mockWebContents,
        mainWindow: null
      }

      permissionManager.setChannelPermission('test-no-window', {
        level: IPCPermissionLevel.ROOT,
        description: 'Test with no window'
      })

      const hasPermission = await permissionManager.checkPermission('test-no-window', context)
      expect(hasPermission).toBe(false)
    })

    it('should handle unknown permission levels gracefully', async () => {
      const context: PermissionContext = {
        senderFrame: mockSenderFrame,
        sender: mockWebContents,
        mainWindow: mockMainWindow
      }

      // Force an unknown permission level
      permissionManager.setChannelPermission('test-unknown', {
        level: 'unknown' as any,
        description: 'Test unknown level'
      })

      const hasPermission = await permissionManager.checkPermission('test-unknown', context)
      expect(hasPermission).toBe(false)
    })
  })
})
