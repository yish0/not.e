import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'

// electron 모킹
jest.mock('electron', () => ({
  BrowserWindow: class MockBrowserWindow {
    id = Math.floor(Math.random() * 1000)
    once = jest.fn()
    constructor() {}
  },
  app: {
    getPath: jest.fn(() => '/tmp/test-app-data'),
    on: jest.fn()
  },
  dialog: {},
  ipcMain: {},
  globalShortcut: {
    register: jest.fn(),
    unregister: jest.fn(),
    unregisterAll: jest.fn(),
    isRegistered: jest.fn()
  }
}))

// 의존성 모킹
jest.mock('../../../main/shortcuts/global-shortcut-manager')
jest.mock('../../../main/shortcuts/local-shortcut-manager')
jest.mock('../../../main/shortcuts/action-executor')
jest.mock('../../../main/shortcuts/config-manager')

import { BrowserWindow } from 'electron'
import { ShortcutManager } from '../../../main/shortcuts/shortcut-manager'
import { ElectronGlobalShortcutManager } from '../../../main/shortcuts/global-shortcut-manager'
import { ElectronLocalShortcutManager } from '../../../main/shortcuts/local-shortcut-manager'
import { DefaultActionExecutor } from '../../../main/shortcuts/action-executor'
import { ShortcutConfigManager } from '../../../main/shortcuts/config-manager'
import { ShortcutConfig } from '../../../main/shortcuts/types'

// Mock 클래스들
const MockElectronGlobalShortcutManager = ElectronGlobalShortcutManager as jest.MockedClass<typeof ElectronGlobalShortcutManager>
const MockElectronLocalShortcutManager = ElectronLocalShortcutManager as jest.MockedClass<typeof ElectronLocalShortcutManager>
const MockDefaultActionExecutor = DefaultActionExecutor as jest.MockedClass<typeof DefaultActionExecutor>
const MockShortcutConfigManager = ShortcutConfigManager as jest.MockedClass<typeof ShortcutConfigManager>

describe('ShortcutManager', () => {
  let shortcutManager: ShortcutManager
  let mockGlobalManager: jest.Mocked<ElectronGlobalShortcutManager>
  let mockLocalManager: jest.Mocked<ElectronLocalShortcutManager>
  let mockActionExecutor: jest.Mocked<DefaultActionExecutor>
  let mockConfigManager: jest.Mocked<ShortcutConfigManager>
  let mockWindow: BrowserWindow

  const mockShortcutConfigs: ShortcutConfig[] = [
    {
      key: 'CommandOrControl+N',
      action: 'file:new',
      description: 'Create new file',
      category: 'file'
    },
    {
      key: 'CommandOrControl+S',
      action: 'file:save',
      description: 'Save current file',
      category: 'file'
    }
  ]

  beforeEach(() => {
    // Mock 인스턴스 생성
    mockGlobalManager = {
      register: jest.fn().mockReturnValue(true),
      unregister: jest.fn().mockReturnValue(true),
      unregisterAll: jest.fn(),
      isRegistered: jest.fn().mockReturnValue(false),
      getRegisteredShortcuts: jest.fn().mockReturnValue([])
    } as any

    mockLocalManager = {
      register: jest.fn().mockReturnValue(true),
      unregister: jest.fn().mockReturnValue(true),
      unregisterAll: jest.fn(),
      getRegisteredShortcuts: jest.fn().mockReturnValue([])
    } as any

    mockActionExecutor = {
      executeAction: jest.fn().mockResolvedValue(undefined),
      registerAction: jest.fn(),
      hasAction: jest.fn().mockReturnValue(true)
    } as any

    mockConfigManager = {
      loadConfig: jest.fn().mockResolvedValue(undefined),
      saveConfig: jest.fn().mockResolvedValue(undefined),
      getGlobalShortcuts: jest.fn().mockReturnValue(mockShortcutConfigs),
      getLocalShortcuts: jest.fn().mockReturnValue(mockShortcutConfigs),
      getAllShortcuts: jest.fn().mockReturnValue(mockShortcutConfigs),
      getShortcutsByCategory: jest.fn().mockReturnValue(mockShortcutConfigs),
      addGlobalShortcut: jest.fn().mockReturnValue(true),
      addLocalShortcut: jest.fn().mockReturnValue(true),
      removeGlobalShortcut: jest.fn().mockReturnValue(true),
      removeLocalShortcut: jest.fn().mockReturnValue(true),
      updateGlobalShortcut: jest.fn().mockReturnValue(true),
      updateLocalShortcut: jest.fn().mockReturnValue(true),
      resetToDefault: jest.fn(),
      hasConflict: jest.fn().mockReturnValue(false)
    } as any

    // Mock 클래스 생성자 설정
    MockElectronGlobalShortcutManager.mockImplementation(() => mockGlobalManager)
    MockElectronLocalShortcutManager.mockImplementation(() => mockLocalManager)
    MockDefaultActionExecutor.mockImplementation(() => mockActionExecutor)
    MockShortcutConfigManager.mockImplementation(() => mockConfigManager)

    // Mock BrowserWindow
    mockWindow = new BrowserWindow()

    // ShortcutManager 인스턴스 생성
    shortcutManager = new ShortcutManager()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('initialization', () => {
    test('should initialize successfully', async () => {
      await shortcutManager.initialize()

      expect(mockConfigManager.loadConfig).toHaveBeenCalledTimes(1)
    })

    test('should handle initialization error', async () => {
      const error = new Error('Config load failed')
      mockConfigManager.loadConfig.mockRejectedValue(error)

      await expect(shortcutManager.initialize()).rejects.toThrow('Config load failed')
    })

    test('should not initialize twice', async () => {
      await shortcutManager.initialize()
      await shortcutManager.initialize()

      expect(mockConfigManager.loadConfig).toHaveBeenCalledTimes(1)
    })
  })

  describe('global shortcuts from config', () => {
    test('should register global shortcuts from config', async () => {
      await shortcutManager.registerGlobalShortcutsFromConfig()

      expect(mockConfigManager.loadConfig).toHaveBeenCalled()
      expect(mockConfigManager.getGlobalShortcuts).toHaveBeenCalled()
      expect(mockGlobalManager.register).toHaveBeenCalledTimes(2)
      expect(mockGlobalManager.register).toHaveBeenCalledWith('CommandOrControl+N', 'file:new')
      expect(mockGlobalManager.register).toHaveBeenCalledWith('CommandOrControl+S', 'file:save')
    })

    test('should handle registration failures', async () => {
      mockGlobalManager.register.mockReturnValueOnce(false).mockReturnValueOnce(true)

      await shortcutManager.registerGlobalShortcutsFromConfig()

      expect(mockGlobalManager.register).toHaveBeenCalledTimes(2)
    })
  })

  describe('local shortcuts from config', () => {
    test('should register local shortcuts from config', async () => {
      await shortcutManager.registerLocalShortcutsFromConfig(mockWindow)

      expect(mockConfigManager.loadConfig).toHaveBeenCalled()
      expect(mockConfigManager.getLocalShortcuts).toHaveBeenCalled()
      expect(mockLocalManager.register).toHaveBeenCalledTimes(2)
      expect(mockLocalManager.register).toHaveBeenCalledWith(mockWindow, 'CommandOrControl+N', 'file:new')
      expect(mockLocalManager.register).toHaveBeenCalledWith(mockWindow, 'CommandOrControl+S', 'file:save')
    })
  })

  describe('individual shortcut registration', () => {
    test('should register individual global shortcut', async () => {
      const result = await shortcutManager.registerGlobalShortcut(
        'CommandOrControl+T',
        'test:action',
        'Test action',
        'test'
      )

      expect(result).toBe(true)
      expect(mockConfigManager.addGlobalShortcut).toHaveBeenCalledWith({
        key: 'CommandOrControl+T',
        action: 'test:action',
        description: 'Test action',
        category: 'test'
      })
      expect(mockGlobalManager.register).toHaveBeenCalledWith('CommandOrControl+T', 'test:action')
      expect(mockConfigManager.saveConfig).toHaveBeenCalled()
    })

    test('should handle global shortcut registration failure', async () => {
      mockGlobalManager.register.mockReturnValue(false)

      const result = await shortcutManager.registerGlobalShortcut(
        'CommandOrControl+T',
        'test:action',
        'Test action',
        'test'
      )

      expect(result).toBe(false)
      expect(mockConfigManager.removeGlobalShortcut).toHaveBeenCalledWith('CommandOrControl+T')
      expect(mockConfigManager.saveConfig).not.toHaveBeenCalled()
    })

    test('should handle config conflict for global shortcut', async () => {
      mockConfigManager.addGlobalShortcut.mockReturnValue(false)

      const result = await shortcutManager.registerGlobalShortcut(
        'CommandOrControl+T',
        'test:action',
        'Test action',
        'test'
      )

      expect(result).toBe(false)
      expect(mockGlobalManager.register).not.toHaveBeenCalled()
    })

    test('should register individual local shortcut', async () => {
      const result = await shortcutManager.registerLocalShortcut(
        mockWindow,
        'CommandOrControl+T',
        'test:action',
        'Test action',
        'test'
      )

      expect(result).toBe(true)
      expect(mockConfigManager.addLocalShortcut).toHaveBeenCalledWith({
        key: 'CommandOrControl+T',
        action: 'test:action',
        description: 'Test action',
        category: 'test'
      })
      expect(mockLocalManager.register).toHaveBeenCalledWith(mockWindow, 'CommandOrControl+T', 'test:action')
      expect(mockConfigManager.saveConfig).toHaveBeenCalled()
    })
  })

  describe('shortcut unregistration', () => {
    test('should unregister global shortcut', async () => {
      const result = await shortcutManager.unregisterGlobalShortcut('CommandOrControl+T')

      expect(result).toBe(true)
      expect(mockGlobalManager.unregister).toHaveBeenCalledWith('CommandOrControl+T')
      expect(mockConfigManager.removeGlobalShortcut).toHaveBeenCalledWith('CommandOrControl+T')
      expect(mockConfigManager.saveConfig).toHaveBeenCalled()
    })

    test('should unregister local shortcut', async () => {
      const result = await shortcutManager.unregisterLocalShortcut(mockWindow, 'CommandOrControl+T')

      expect(result).toBe(true)
      expect(mockLocalManager.unregister).toHaveBeenCalledWith(mockWindow, 'CommandOrControl+T')
      expect(mockConfigManager.removeLocalShortcut).toHaveBeenCalledWith('CommandOrControl+T')
      expect(mockConfigManager.saveConfig).toHaveBeenCalled()
    })

    test('should unregister all global shortcuts', () => {
      shortcutManager.unregisterAllGlobalShortcuts()

      expect(mockGlobalManager.unregisterAll).toHaveBeenCalled()
    })

    test('should unregister all local shortcuts for window', () => {
      shortcutManager.unregisterAllLocalShortcuts(mockWindow)

      expect(mockLocalManager.unregisterAll).toHaveBeenCalledWith(mockWindow)
    })
  })

  describe('action management', () => {
    test('should register action', () => {
      const handler = jest.fn()
      
      shortcutManager.registerAction('test:action', handler, 'Test action', 'test')

      expect(mockActionExecutor.registerAction).toHaveBeenCalledWith({
        name: 'test:action',
        handler,
        description: 'Test action',
        category: 'test'
      })
    })
  })

  describe('configuration queries', () => {
    test('should get all shortcut configs', async () => {
      const result = await shortcutManager.getShortcutConfigs()

      expect(result).toEqual(mockShortcutConfigs)
      expect(mockConfigManager.getAllShortcuts).toHaveBeenCalled()
    })

    test('should get global shortcut configs', async () => {
      const result = await shortcutManager.getGlobalShortcutConfigs()

      expect(result).toEqual(mockShortcutConfigs)
      expect(mockConfigManager.getGlobalShortcuts).toHaveBeenCalled()
    })

    test('should get local shortcut configs', async () => {
      const result = await shortcutManager.getLocalShortcutConfigs()

      expect(result).toEqual(mockShortcutConfigs)
      expect(mockConfigManager.getLocalShortcuts).toHaveBeenCalled()
    })

    test('should get shortcuts by category', async () => {
      const result = await shortcutManager.getShortcutsByCategory('file')

      expect(result).toEqual(mockShortcutConfigs)
      expect(mockConfigManager.getShortcutsByCategory).toHaveBeenCalledWith('file')
    })
  })

  describe('configuration updates', () => {
    test('should update global shortcut', async () => {
      const newConfig = { description: 'Updated description' }

      const result = await shortcutManager.updateGlobalShortcut('CommandOrControl+N', newConfig)

      expect(result).toBe(true)
      expect(mockConfigManager.updateGlobalShortcut).toHaveBeenCalledWith('CommandOrControl+N', newConfig)
      expect(mockConfigManager.saveConfig).toHaveBeenCalled()
    })

    test('should handle key change in global shortcut update', async () => {
      const newConfig = { key: 'CommandOrControl+T', action: 'file:new' }

      await shortcutManager.updateGlobalShortcut('CommandOrControl+N', newConfig)

      expect(mockGlobalManager.unregister).toHaveBeenCalledWith('CommandOrControl+N')
      expect(mockGlobalManager.register).toHaveBeenCalledWith('CommandOrControl+T', 'file:new')
    })

    test('should update local shortcut', async () => {
      const newConfig = { description: 'Updated description' }

      const result = await shortcutManager.updateLocalShortcut('CommandOrControl+N', newConfig)

      expect(result).toBe(true)
      expect(mockConfigManager.updateLocalShortcut).toHaveBeenCalledWith('CommandOrControl+N', newConfig)
      expect(mockConfigManager.saveConfig).toHaveBeenCalled()
    })
  })

  describe('reset functionality', () => {
    test('should reset to default', async () => {
      await shortcutManager.resetToDefault()

      expect(mockGlobalManager.unregisterAll).toHaveBeenCalled()
      expect(mockConfigManager.resetToDefault).toHaveBeenCalled()
      expect(mockConfigManager.saveConfig).toHaveBeenCalled()
      expect(mockConfigManager.getGlobalShortcuts).toHaveBeenCalled()
      expect(mockGlobalManager.register).toHaveBeenCalled()
    })
  })

  describe('conflict detection', () => {
    test('should check global shortcut conflict', async () => {
      const result = await shortcutManager.hasGlobalShortcutConflict('CommandOrControl+T')

      expect(result).toBe(false)
      expect(mockConfigManager.hasConflict).toHaveBeenCalledWith('CommandOrControl+T', 'global')
    })

    test('should check local shortcut conflict', async () => {
      const result = await shortcutManager.hasLocalShortcutConflict('CommandOrControl+T')

      expect(result).toBe(false)
      expect(mockConfigManager.hasConflict).toHaveBeenCalledWith('CommandOrControl+T', 'local')
    })
  })

  describe('convenience methods', () => {
    test('should setup window with shortcuts', async () => {
      await shortcutManager.setupWindow(mockWindow)

      expect(mockConfigManager.getLocalShortcuts).toHaveBeenCalled()
      expect(mockLocalManager.register).toHaveBeenCalledTimes(2)
      expect(mockWindow.once).toHaveBeenCalledWith('closed', expect.any(Function))
    })

    test('should setup global shortcuts', async () => {
      await shortcutManager.setupGlobalShortcuts()

      expect(mockConfigManager.getGlobalShortcuts).toHaveBeenCalled()
      expect(mockGlobalManager.register).toHaveBeenCalledTimes(2)
    })

    test('should cleanup on window close', async () => {
      await shortcutManager.setupWindow(mockWindow)

      // 윈도우 close 이벤트 시뮬레이션
      const closeHandler = (mockWindow.once as jest.Mock).mock.calls[0][1]
      closeHandler()

      expect(mockLocalManager.unregisterAll).toHaveBeenCalledWith(mockWindow)
    })
  })
})