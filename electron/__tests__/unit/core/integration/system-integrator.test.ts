import { DefaultSystemIntegrator } from '../../../../main/core/integration/system-integrator'
import { getMenuManager } from '../../../../main/core/menu'
import type { ShortcutAction } from '../../../../main/shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../../../main/shortcuts/types/shortcut-types'

// Mock dependencies
jest.mock('../../../../main/core/menu', () => ({
  getMenuManager: jest.fn()
}))

jest.mock('../../../../main/shortcuts', () => ({
  getShortcutManager: jest.fn()
}))

jest.mock('../../../../main/vault', () => ({
  getVaultManager: jest.fn()
}))

jest.mock('../../../../main/ipc', () => ({
  setupIPCHandlers: jest.fn()
}))

jest.mock('../../../../main/actions/index', () => ({
  getAllDefaultActions: jest.fn()
}))

const mockGetMenuManager = getMenuManager as jest.MockedFunction<typeof getMenuManager>

describe('SystemIntegrator - Menu Integration', () => {
  let systemIntegrator: DefaultSystemIntegrator
  let mockMenuManager: any
  let mockShortcutManager: any
  let mockVaultManager: any

  const mockActions: ShortcutAction[] = [
    {
      name: 'new-note',
      description: 'Create new note',
      category: ShortcutCategory.FILE,
      handler: jest.fn()
    },
    {
      name: 'save-note',
      description: 'Save current note',
      category: ShortcutCategory.FILE,
      handler: jest.fn()
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock MenuManager
    mockMenuManager = {
      initializeWithActions: jest.fn(),
      initializeWithDefaultMenu: jest.fn(),
      updateMenu: jest.fn(),
      cleanup: jest.fn(),
      isMenuSet: jest.fn().mockReturnValue(false)
    }
    mockGetMenuManager.mockReturnValue(mockMenuManager)

    // Mock ShortcutManager
    mockShortcutManager = {
      initialize: jest.fn().mockResolvedValue(undefined),
      registerAction: jest.fn(),
      setupGlobalShortcuts: jest.fn().mockResolvedValue(undefined),
      setupWindow: jest.fn().mockResolvedValue(undefined)
    }

    const { getShortcutManager } = require('../../../../main/shortcuts')
    getShortcutManager.mockReturnValue(mockShortcutManager)

    // Mock VaultManager
    mockVaultManager = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getCurrentVault: jest.fn().mockResolvedValue({ name: 'test', path: '/test' }),
      shouldShowVaultSelector: jest.fn().mockReturnValue(false)
    }

    const { getVaultManager } = require('../../../../main/vault')
    getVaultManager.mockReturnValue(mockVaultManager)

    // Mock getAllDefaultActions
    const { getAllDefaultActions } = require('../../../../main/actions/index')
    getAllDefaultActions.mockReturnValue(mockActions)

    systemIntegrator = new DefaultSystemIntegrator()
  })

  describe('메뉴 시스템 초기화', () => {
    it('메뉴 시스템을 초기화할 수 있어야 한다', async () => {
      const result = await systemIntegrator.initializeMenuSystem()
      
      expect(result.success).toBe(true)
      expect(mockMenuManager.initializeWithActions).toHaveBeenCalledWith(
        mockActions,
        expect.any(Object)
      )
    })

    it('메뉴 시스템 초기화 실패를 처리해야 한다', async () => {
      mockMenuManager.initializeWithActions.mockImplementationOnce(() => {
        throw new Error('Menu initialization failed')
      })

      const result = await systemIntegrator.initializeMenuSystem()
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Menu initialization failed')
    })
  })

  describe('액션과 메뉴 동기화', () => {
    it('기본 액션들을 등록하고 메뉴에 반영해야 한다', () => {
      systemIntegrator.registerDefaultActions()
      
      expect(mockShortcutManager.registerAction).toHaveBeenCalledTimes(mockActions.length)
      mockActions.forEach(action => {
        expect(mockShortcutManager.registerAction).toHaveBeenCalledWith(
          action.name,
          action.handler,
          action.description,
          action.category
        )
      })
    })

    it('액션 변경 시 메뉴를 업데이트해야 한다', async () => {
      const newActions: ShortcutAction[] = [
        {
          name: 'open-file',
          description: 'Open file',
          category: ShortcutCategory.FILE,
          handler: jest.fn()
        }
      ]

      await systemIntegrator.updateMenuWithActions(newActions)
      
      expect(mockMenuManager.updateMenu).toHaveBeenCalledWith(
        newActions,
        expect.any(Object)
      )
    })
  })

  describe('윈도우 통합', () => {
    it('윈도우 설정 시 메뉴가 설정되어 있지 않으면 초기화해야 한다', async () => {
      const mockWindow = { id: 1 } as any
      mockMenuManager.isMenuSet.mockReturnValue(false)

      await systemIntegrator.setupWindowIntegration(mockWindow)
      
      expect(mockMenuManager.initializeWithActions).toHaveBeenCalled()
      expect(mockShortcutManager.setupWindow).toHaveBeenCalledWith(mockWindow)
    })

    it('윈도우 설정 시 메뉴가 이미 설정되어 있으면 스킵해야 한다', async () => {
      const mockWindow = { id: 1 } as any
      mockMenuManager.isMenuSet.mockReturnValue(true)

      await systemIntegrator.setupWindowIntegration(mockWindow)
      
      expect(mockMenuManager.initializeWithActions).not.toHaveBeenCalled()
      expect(mockShortcutManager.setupWindow).toHaveBeenCalledWith(mockWindow)
    })
  })

  describe('전체 시스템 초기화', () => {
    it('모든 시스템을 순서대로 초기화해야 한다', async () => {
      const vaultResult = await systemIntegrator.initializeVaultSystem()
      const shortcutResult = await systemIntegrator.initializeShortcutSystem()
      const menuResult = await systemIntegrator.initializeMenuSystem()
      
      expect(vaultResult.success).toBe(true)
      expect(shortcutResult.success).toBe(true)
      expect(menuResult.success).toBe(true)
      
      expect(mockVaultManager.initialize).toHaveBeenCalled()
      expect(mockShortcutManager.initialize).toHaveBeenCalled()
      expect(mockMenuManager.initializeWithActions).toHaveBeenCalled()
    })

    it('시스템 초기화 실패 시 적절한 에러를 반환해야 한다', async () => {
      mockVaultManager.initialize.mockRejectedValueOnce(new Error('Vault failed'))
      
      const result = await systemIntegrator.initializeVaultSystem()
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('Vault failed')
    })
  })

  describe('메뉴 동적 업데이트', () => {
    it('설정 변경 시 메뉴를 동적으로 업데이트해야 한다', async () => {
      const newConfig = { includeAppMenu: false, includeWindowMenu: false }
      
      await systemIntegrator.updateMenuConfiguration(newConfig)
      
      expect(mockMenuManager.updateMenu).toHaveBeenCalledWith(
        mockActions,
        newConfig
      )
    })

    it('액션 추가 시 메뉴에 새 항목을 추가해야 한다', async () => {
      const additionalAction: ShortcutAction = {
        name: 'find-in-vault',
        description: 'Find in vault',
        category: ShortcutCategory.EDIT,
        handler: jest.fn()
      }

      await systemIntegrator.addActionToMenu(additionalAction)
      
      expect(mockShortcutManager.registerAction).toHaveBeenCalledWith(
        additionalAction.name,
        additionalAction.handler,
        additionalAction.description,
        additionalAction.category
      )
      expect(mockMenuManager.updateMenu).toHaveBeenCalled()
    })

    it('액션 제거 시 메뉴에서 항목을 제거해야 한다', async () => {
      const actionToRemove = 'save-note'
      
      await systemIntegrator.removeActionFromMenu(actionToRemove)
      
      expect(mockMenuManager.updateMenu).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.not.objectContaining({ name: actionToRemove })
        ]),
        expect.any(Object)
      )
    })
  })

  describe('메뉴 정리', () => {
    it('시스템 종료 시 메뉴를 정리해야 한다', () => {
      systemIntegrator.cleanup()
      
      expect(mockMenuManager.cleanup).toHaveBeenCalled()
    })
  })
})