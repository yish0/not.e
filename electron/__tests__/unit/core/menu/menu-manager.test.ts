import { Menu } from 'electron'
import { MenuManager } from '../../../../main/core/menu/menu-manager'
import type { ShortcutActionHandler } from '../../../../main/shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../../../main/shortcuts/types/shortcut-types'

// Mock Electron
jest.mock('electron', () => ({
  Menu: {
    buildFromTemplate: jest.fn().mockReturnValue({ id: 'mock-menu' }),
    setApplicationMenu: jest.fn()
  }
}))

const mockMenu = Menu as jest.Mocked<typeof Menu>

describe('MenuManager', () => {
  let menuManager: MenuManager

  const mockActionHandler: ShortcutActionHandler = jest.fn()
  const mockActions = [
    {
      name: 'new-note',
      description: 'Create new note',
      category: ShortcutCategory.FILE,
      handler: mockActionHandler
    },
    {
      name: 'save-note',
      description: 'Save current note',
      category: ShortcutCategory.FILE,
      handler: mockActionHandler
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    menuManager = new MenuManager()
  })

  describe('초기화', () => {
    it('MenuManager 인스턴스가 생성되어야 한다', () => {
      expect(menuManager).toBeInstanceOf(MenuManager)
    })

    it('초기 상태에서 메뉴가 설정되지 않은 상태여야 한다', () => {
      expect(menuManager.isMenuSet()).toBe(false)
    })
  })

  describe('메뉴 생성', () => {
    it('액션 배열로부터 메뉴를 생성할 수 있어야 한다', () => {
      const menu = menuManager.createMenu(mockActions)
      
      expect(menu).toBeDefined()
      expect(mockMenu.buildFromTemplate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            label: 'File',
            submenu: expect.arrayContaining([
              expect.objectContaining({
                label: 'New Note',
                accelerator: expect.any(String),
                click: expect.any(Function)
              })
            ])
          })
        ])
      )
    })

    it('빈 액션 배열로도 기본 메뉴를 생성할 수 있어야 한다', () => {
      const menu = menuManager.createMenu([])
      
      expect(menu).toBeDefined()
      expect(mockMenu.buildFromTemplate).toHaveBeenCalled()
    })
  })

  describe('메뉴 설정', () => {
    it('생성된 메뉴를 애플리케이션 메뉴로 설정할 수 있어야 한다', () => {
      const menu = menuManager.createMenu(mockActions)
      menuManager.setApplicationMenu(menu)
      
      expect(mockMenu.setApplicationMenu).toHaveBeenCalledWith(menu)
      expect(menuManager.isMenuSet()).toBe(true)
    })

    it('null 메뉴를 설정하면 메뉴가 제거되어야 한다', () => {
      menuManager.setApplicationMenu(null)
      
      expect(mockMenu.setApplicationMenu).toHaveBeenCalledWith(null)
      expect(menuManager.isMenuSet()).toBe(false)
    })
  })

  describe('메뉴 업데이트', () => {
    it('새로운 액션으로 메뉴를 업데이트할 수 있어야 한다', () => {
      const newActions = [
        {
          name: 'open-file',
          description: 'Open file',
          category: ShortcutCategory.FILE,
          handler: mockActionHandler
        }
      ]

      menuManager.updateMenu(newActions)
      
      expect(mockMenu.buildFromTemplate).toHaveBeenCalledTimes(1)
      expect(mockMenu.setApplicationMenu).toHaveBeenCalledTimes(1)
      expect(menuManager.isMenuSet()).toBe(true)
    })

    it('메뉴 업데이트 중 에러가 발생하면 처리되어야 한다', () => {
      mockMenu.buildFromTemplate.mockImplementationOnce(() => {
        throw new Error('Menu creation failed')
      })

      expect(() => {
        menuManager.updateMenu(mockActions)
      }).not.toThrow()
      
      expect(menuManager.isMenuSet()).toBe(false)
    })
  })

  describe('메뉴 초기화', () => {
    it('기본 메뉴로 초기화할 수 있어야 한다', () => {
      menuManager.initializeWithDefaultMenu()
      
      expect(mockMenu.buildFromTemplate).toHaveBeenCalled()
      expect(mockMenu.setApplicationMenu).toHaveBeenCalled()
      expect(menuManager.isMenuSet()).toBe(true)
    })

    it('액션과 함께 메뉴를 초기화할 수 있어야 한다', () => {
      menuManager.initializeWithActions(mockActions)
      
      expect(mockMenu.buildFromTemplate).toHaveBeenCalled()
      expect(mockMenu.setApplicationMenu).toHaveBeenCalled()
      expect(menuManager.isMenuSet()).toBe(true)
    })
  })

  describe('메뉴 정리', () => {
    it('메뉴를 정리할 수 있어야 한다', () => {
      menuManager.initializeWithDefaultMenu()
      expect(menuManager.isMenuSet()).toBe(true)
      
      menuManager.cleanup()
      
      expect(mockMenu.setApplicationMenu).toHaveBeenLastCalledWith(null)
      expect(menuManager.isMenuSet()).toBe(false)
    })
  })
})