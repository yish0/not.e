import { describe, test, expect, beforeEach, jest } from '@jest/globals'

// Mock electron
jest.mock('electron', () => ({
  BrowserWindow: {
    getAllWindows: jest.fn(() => [])
  },
  screen: {
    getCursorScreenPoint: jest.fn(() => ({ x: 100, y: 100 })),
    getDisplayNearestPoint: jest.fn(() => ({
      workArea: { x: 0, y: 0, width: 1920, height: 1080 }
    }))
  }
}))

import { BrowserWindow, screen } from 'electron'
import { 
  findTargetWindow, 
  centerWindowOnCurrentDisplay, 
  showWindow, 
  toggleWindowVisibility 
} from '../../../../main/actions/global/window-utils'

describe('Window Utils', () => {
  let mockWindow: jest.Mocked<BrowserWindow>

  beforeEach(() => {
    mockWindow = {
      isDestroyed: jest.fn(() => false),
      isMinimized: jest.fn(() => false),
      isVisible: jest.fn(() => true),
      isFocused: jest.fn(() => true),
      getBounds: jest.fn(() => ({ x: 0, y: 0, width: 800, height: 600 })),
      setPosition: jest.fn(),
      restore: jest.fn(),
      show: jest.fn(),
      focus: jest.fn(),
      hide: jest.fn()
    } as any

    jest.clearAllMocks()
  })

  describe('findTargetWindow', () => {
    test('should return provided window if valid', () => {
      const result = findTargetWindow(mockWindow)
      expect(result).toBe(mockWindow)
    })

    test('should return null if window is destroyed', () => {
      mockWindow.isDestroyed.mockReturnValue(true)
      const result = findTargetWindow(mockWindow)
      expect(result).toBeNull()
    })

    test('should find alternative window when provided window is null', () => {
      ;(BrowserWindow.getAllWindows as jest.Mock).mockReturnValue([mockWindow])
      
      const result = findTargetWindow(null)
      expect(result).toBe(mockWindow)
    })
  })

  describe('centerWindowOnCurrentDisplay', () => {
    test('should center window on current display', () => {
      centerWindowOnCurrentDisplay(mockWindow)

      expect(screen.getCursorScreenPoint).toHaveBeenCalled()
      expect(screen.getDisplayNearestPoint).toHaveBeenCalledWith({ x: 100, y: 100 })
      expect(mockWindow.setPosition).toHaveBeenCalledWith(560, 240) // centered position
    })
  })

  describe('showWindow', () => {
    test('should show and focus window', () => {
      showWindow(mockWindow)

      expect(mockWindow.show).toHaveBeenCalled()
      expect(mockWindow.focus).toHaveBeenCalled()
      expect(mockWindow.setPosition).toHaveBeenCalled()
    })

    test('should restore minimized window', () => {
      mockWindow.isMinimized.mockReturnValue(true)
      
      showWindow(mockWindow)

      expect(mockWindow.restore).toHaveBeenCalled()
    })
  })

  describe('toggleWindowVisibility', () => {
    test('should hide visible and focused window', () => {
      mockWindow.isVisible.mockReturnValue(true)
      mockWindow.isFocused.mockReturnValue(true)

      toggleWindowVisibility(mockWindow)

      expect(mockWindow.hide).toHaveBeenCalled()
    })

    test('should show invisible window', () => {
      mockWindow.isVisible.mockReturnValue(false)

      toggleWindowVisibility(mockWindow)

      expect(mockWindow.show).toHaveBeenCalled()
      expect(mockWindow.focus).toHaveBeenCalled()
    })
  })
})