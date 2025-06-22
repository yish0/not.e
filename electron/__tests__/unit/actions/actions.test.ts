import { describe, test, expect, beforeEach, jest } from '@jest/globals'

// Mock electron
jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
  screen: {
    getCursorScreenPoint: jest.fn(() => ({ x: 100, y: 100 })),
    getDisplayNearestPoint: jest.fn(() => ({
      id: 1,
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      workArea: { x: 0, y: 0, width: 1920, height: 1080 }
    }))
  }
}))

// Mock toggle-mode-manager
jest.mock('../../../main/actions/global/toggle-mode-manager', () => ({
  getWindowMode: jest.fn().mockResolvedValue('toggle'),
  getToggleSettings: jest.fn().mockResolvedValue({
    toggleType: 'standard',
    sidebarPosition: 'right',
    sidebarWidth: 400
  })
}))

import { BrowserWindow } from 'electron'
import { getAllDefaultActions, getActionsByCategory } from '../../../main/actions'
import { ShortcutCategory } from '../../../main/shortcuts/types/shortcut-types'

describe('Actions Module', () => {
  let mockWindow: jest.Mocked<BrowserWindow>

  beforeEach(() => {
    mockWindow = {
      webContents: {
        send: jest.fn(),
        setZoomFactor: jest.fn(),
        getZoomFactor: jest.fn(() => 1.0),
        toggleDevTools: jest.fn()
      },
      isMinimized: jest.fn(() => false),
      restore: jest.fn(),
      focus: jest.fn(),
      isVisible: jest.fn(() => true),
      isFocused: jest.fn(() => true),
      hide: jest.fn(),
      show: jest.fn(),
      getBounds: jest.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
      setPosition: jest.fn(),
      getAllWindows: jest.fn(() => [mockWindow]),
      isDestroyed: jest.fn(() => false)
    } as any

    // Mock static methods
    ;(BrowserWindow as any).getAllWindows = jest.fn(() => [mockWindow])

    jest.clearAllMocks()
  })

  describe('getActionsByCategory', () => {
    test('should filter actions by category', () => {
      const fileActions = getActionsByCategory('file')
      const viewActions = getActionsByCategory('view')

      expect(fileActions.every((action) => action.category === ShortcutCategory.FILE)).toBe(true)
      expect(viewActions.every((action) => action.category === ShortcutCategory.VIEW)).toBe(true)
    })

    test('should return empty array for non-existent category', () => {
      const actions = getActionsByCategory('non-existent')
      expect(actions).toEqual([])
    })
  })

  describe('File Actions', () => {
    test('should handle new-note action', () => {
      const actions = getAllDefaultActions()
      const newNoteAction = actions.find((action) => action.name === 'new-note')

      expect(newNoteAction).toBeDefined()
      newNoteAction!.handler(mockWindow)

      expect(mockWindow.webContents.send).toHaveBeenCalledWith('shortcut:new-note')
    })

    test('should handle save-note action', () => {
      const actions = getAllDefaultActions()
      const saveNoteAction = actions.find((action) => action.name === 'save-note')

      expect(saveNoteAction).toBeDefined()
      saveNoteAction!.handler(mockWindow)

      expect(mockWindow.webContents.send).toHaveBeenCalledWith('shortcut:save-note')
    })
  })

  describe('View Actions', () => {
    test('should handle zoom-in action', () => {
      const actions = getAllDefaultActions()
      const zoomInAction = actions.find((action) => action.name === 'zoom-in')

      expect(zoomInAction).toBeDefined()
      zoomInAction!.handler(mockWindow)

      expect(mockWindow.webContents.getZoomFactor).toHaveBeenCalled()
      expect(mockWindow.webContents.setZoomFactor).toHaveBeenCalledWith(1.1)
    })

    test('should handle zoom-out action', () => {
      const actions = getAllDefaultActions()
      const zoomOutAction = actions.find((action) => action.name === 'zoom-out')

      expect(zoomOutAction).toBeDefined()
      zoomOutAction!.handler(mockWindow)

      expect(mockWindow.webContents.getZoomFactor).toHaveBeenCalled()
      expect(mockWindow.webContents.setZoomFactor).toHaveBeenCalledWith(0.9)
    })

    test('should handle zoom-reset action', () => {
      const actions = getAllDefaultActions()
      const zoomResetAction = actions.find((action) => action.name === 'zoom-reset')

      expect(zoomResetAction).toBeDefined()
      zoomResetAction!.handler(mockWindow)

      expect(mockWindow.webContents.setZoomFactor).toHaveBeenCalledWith(1.0)
    })
  })

  describe('Dev Actions', () => {
    test('should handle toggle-devtools action', () => {
      const actions = getAllDefaultActions()
      const devToolsAction = actions.find((action) => action.name === 'toggle-devtools')

      expect(devToolsAction).toBeDefined()
      devToolsAction!.handler(mockWindow)

      expect(mockWindow.webContents.toggleDevTools).toHaveBeenCalled()
    })
  })

  describe('Global Actions', () => {
    test('should handle quick-note action with existing window', () => {
      const actions = getAllDefaultActions()
      const quickNoteAction = actions.find((action) => action.name === 'quick-note')

      expect(quickNoteAction).toBeDefined()
      quickNoteAction!.handler(mockWindow)

      expect(mockWindow.focus).toHaveBeenCalled()
      expect(mockWindow.webContents.send).toHaveBeenCalledWith('shortcut:quick-note')
    })

    test('should handle toggle-window-standard action when window is visible and focused', async () => {
      const actions = getAllDefaultActions()
      const toggleAction = actions.find((action) => action.name === 'toggle-window-standard')

      expect(toggleAction).toBeDefined()
      
      // Mock the window mode to be in toggle mode
      mockWindow.isVisible.mockReturnValue(true)
      mockWindow.isFocused.mockReturnValue(true)
      
      await toggleAction!.handler(mockWindow)

      expect(mockWindow.hide).toHaveBeenCalled()
    })
  })
})
