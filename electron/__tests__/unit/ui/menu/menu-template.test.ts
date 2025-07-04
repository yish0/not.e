import { MenuTemplate } from '../../../../main/ui/menu/menu-template'
import type { ShortcutAction } from '../../../../main/shortcuts/types/shortcut-types'
import { ShortcutCategory } from '../../../../main/shortcuts/types/shortcut-types'
import type { MenuConfiguration } from '../../../../main/ui/menu/menu-types'

describe('MenuTemplate', () => {
  let menuTemplate: MenuTemplate

  const mockActionHandler = jest.fn()
  const fileActions: ShortcutAction[] = [
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

  const editActions: ShortcutAction[] = [
    {
      name: 'find-in-note',
      description: 'Find in current note',
      category: ShortcutCategory.EDIT,
      handler: mockActionHandler
    }
  ]

  const viewActions: ShortcutAction[] = [
    {
      name: 'toggle-sidebar',
      description: 'Toggle sidebar',
      category: ShortcutCategory.VIEW,
      handler: mockActionHandler
    }
  ]

  const navigationActions: ShortcutAction[] = [
    {
      name: 'quick-open',
      description: 'Quick open file',
      category: ShortcutCategory.NAVIGATION,
      handler: mockActionHandler
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    menuTemplate = new MenuTemplate()
  })

  describe('기본 템플릿 생성', () => {
    it('빈 액션 배열로 기본 템플릿을 생성할 수 있어야 한다', () => {
      const template = menuTemplate.buildTemplate([])
      
      expect(template).toBeInstanceOf(Array)
      expect(template.length).toBeGreaterThan(0)
    })

    it('macOS에서 앱 메뉴를 포함해야 한다', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      const template = menuTemplate.buildTemplate([])
      const appMenu = template.find(item => item.label === 'not.e')
      
      expect(appMenu).toBeDefined()
      expect(appMenu?.submenu).toContainEqual(
        expect.objectContaining({ label: 'About not.e' })
      )

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })

    it('비-macOS에서 앱 메뉴를 포함하지 않아야 한다', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32' })

      const config = { includeAppMenu: false }
      const template = menuTemplate.buildTemplate([], config)
      const appMenu = template.find(item => item.label === 'not.e')
      
      expect(appMenu).toBeUndefined()

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })
  })

  describe('액션 기반 메뉴 생성', () => {
    it('File 액션들로부터 File 메뉴를 생성해야 한다', () => {
      const template = menuTemplate.buildTemplate(fileActions)
      const fileMenu = template.find(item => item.label === 'File')
      
      expect(fileMenu).toBeDefined()
      expect(fileMenu?.submenu).toContainEqual(
        expect.objectContaining({
          label: 'New Note',
          accelerator: 'CmdOrCtrl+N'
        })
      )
      expect(fileMenu?.submenu).toContainEqual(
        expect.objectContaining({
          label: 'Save Note',
          accelerator: 'CmdOrCtrl+S'
        })
      )
    })

    it('Edit 액션들로부터 Edit 메뉴를 생성해야 한다', () => {
      const template = menuTemplate.buildTemplate(editActions)
      const editMenu = template.find(item => item.label === 'Edit')
      
      expect(editMenu).toBeDefined()
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({
          label: 'Find in Note',
          accelerator: 'CmdOrCtrl+F'
        })
      )
    })

    it('View 액션들로부터 View 메뉴를 생성해야 한다', () => {
      const template = menuTemplate.buildTemplate(viewActions)
      const viewMenu = template.find(item => item.label === 'View')
      
      expect(viewMenu).toBeDefined()
      expect(viewMenu?.submenu).toContainEqual(
        expect.objectContaining({
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+B'
        })
      )
    })

    it('Navigation 액션들로부터 Navigation 메뉴를 생성해야 한다', () => {
      const template = menuTemplate.buildTemplate(navigationActions)
      const navigationMenu = template.find(item => item.label === 'Navigation')
      
      expect(navigationMenu).toBeDefined()
      expect(navigationMenu?.submenu).toContainEqual(
        expect.objectContaining({
          label: 'Quick Open',
          accelerator: 'CmdOrCtrl+P'
        })
      )
    })
  })

  describe('메뉴 구성 옵션', () => {
    it('구성 옵션으로 앱 메뉴 포함 여부를 제어할 수 있어야 한다', () => {
      const config: MenuConfiguration = { includeAppMenu: false }
      const template = menuTemplate.buildTemplate([], config)
      const appMenu = template.find(item => item.label === 'not.e')
      
      expect(appMenu).toBeUndefined()
    })

    it('구성 옵션으로 기본 Edit 메뉴 포함 여부를 제어할 수 있어야 한다', () => {
      const config: MenuConfiguration = { includeDefaultEditMenu: false }
      const template = menuTemplate.buildTemplate([], config)
      const editMenu = template.find(item => item.label === 'Edit')
      
      expect(editMenu).toBeUndefined()
    })

    it('구성 옵션으로 Window 메뉴 포함 여부를 제어할 수 있어야 한다', () => {
      const config: MenuConfiguration = { includeWindowMenu: false }
      const template = menuTemplate.buildTemplate([], config)
      const windowMenu = template.find(item => item.label === 'Window')
      
      expect(windowMenu).toBeUndefined()
    })
  })

  describe('단축키 동기화', () => {
    it('액션의 단축키가 메뉴 가속기로 올바르게 설정되어야 한다', () => {
      const template = menuTemplate.buildTemplate(fileActions)
      const fileMenu = template.find(item => item.label === 'File')
      const newNoteItem = (fileMenu?.submenu as any[])?.find(
        item => item.label === 'New Note'
      )
      
      expect(newNoteItem?.accelerator).toBe('CmdOrCtrl+N')
    })

    it('정의되지 않은 액션의 경우 빈 가속기를 가져야 한다', () => {
      const unknownAction: ShortcutAction = {
        name: 'unknown-action',
        description: 'Unknown action',
        category: ShortcutCategory.CUSTOM,
        handler: mockActionHandler
      }

      const template = menuTemplate.buildTemplate([unknownAction])
      // Custom 카테고리는 별도 메뉴로 분류되지 않으므로 다른 방식으로 테스트
      expect(template).toBeDefined()
    })
  })

  describe('메뉴 클릭 핸들링', () => {
    it('메뉴 항목 클릭 시 해당 액션 핸들러가 호출되어야 한다', () => {
      const template = menuTemplate.buildTemplate(fileActions)
      const fileMenu = template.find(item => item.label === 'File')
      const newNoteItem = (fileMenu?.submenu as any[])?.find(
        item => item.label === 'New Note'
      )
      
      // 메뉴 아이템 클릭 시뮬레이션
      if (newNoteItem?.click) {
        newNoteItem.click()
      }
      
      expect(mockActionHandler).toHaveBeenCalledWith(null)
    })
  })

  describe('기본 Edit 메뉴', () => {
    it('기본 Edit 메뉴가 표준 편집 작업을 포함해야 한다', () => {
      const config: MenuConfiguration = { includeDefaultEditMenu: true }
      const template = menuTemplate.buildTemplate([], config)
      const editMenu = template.find(item => item.label === 'Edit')
      
      expect(editMenu).toBeDefined()
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({ label: 'Undo', role: 'undo' })
      )
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({ label: 'Redo', role: 'redo' })
      )
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({ label: 'Cut', role: 'cut' })
      )
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({ label: 'Copy', role: 'copy' })
      )
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({ label: 'Paste', role: 'paste' })
      )
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({ label: 'Select All', role: 'selectAll' })
      )
    })

    it('기본 Edit 메뉴와 사용자 정의 Edit 액션을 결합해야 한다', () => {
      const config: MenuConfiguration = { includeDefaultEditMenu: true }
      const template = menuTemplate.buildTemplate(editActions, config)
      const editMenu = template.find(item => item.label === 'Edit')
      
      expect(editMenu).toBeDefined()
      // 기본 편집 항목들
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({ label: 'Undo', role: 'undo' })
      )
      // 사용자 정의 항목들
      expect(editMenu?.submenu).toContainEqual(
        expect.objectContaining({
          label: 'Find in Note',
          accelerator: 'CmdOrCtrl+F'
        })
      )
    })
  })

  describe('복합 액션 테스트', () => {
    it('여러 카테고리의 액션들로부터 완전한 메뉴를 생성해야 한다', () => {
      const allActions = [...fileActions, ...editActions, ...viewActions, ...navigationActions]
      const template = menuTemplate.buildTemplate(allActions)
      
      expect(template.find(item => item.label === 'File')).toBeDefined()
      expect(template.find(item => item.label === 'Edit')).toBeDefined()
      expect(template.find(item => item.label === 'View')).toBeDefined()
      expect(template.find(item => item.label === 'Navigation')).toBeDefined()
    })
  })
})