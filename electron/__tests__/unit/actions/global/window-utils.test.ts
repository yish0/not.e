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
  showWindowAsSidebar,
  getSidebarBounds
} from '../../../../main/core/window/window-utils'

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
      setBounds: jest.fn(),
      restore: jest.fn(),
      show: jest.fn(),
      focus: jest.fn(),
      hide: jest.fn(),
      setVisibleOnAllWorkspaces: jest.fn()
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
    test('should restore minimized window', async () => {
      mockWindow.isMinimized.mockReturnValue(true)

      await showWindow(mockWindow)

      expect(mockWindow.restore).toHaveBeenCalled()
    })

    test('should set window position on macOS', async () => {
      // Mock process.platform for this test
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      await showWindow(mockWindow)

      expect(mockWindow.setPosition).toHaveBeenCalled()

      // Restore original platform
      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })
  })

  describe('showWindowAsSidebar', () => {
    test('should show window as sidebar with correct bounds', () => {
      showWindowAsSidebar(mockWindow, 'right', 400)

      expect(mockWindow.setBounds).toHaveBeenCalledWith({
        x: 1520, // 1920 - 400
        y: 0,
        width: 400,
        height: 1080
      })
      expect(mockWindow.show).toHaveBeenCalled()
      expect(mockWindow.focus).toHaveBeenCalled()
    })

    test('should restore minimized window before showing as sidebar', () => {
      mockWindow.isMinimized.mockReturnValue(true)

      showWindowAsSidebar(mockWindow, 'left', 300)

      expect(mockWindow.restore).toHaveBeenCalled()
      expect(mockWindow.setBounds).toHaveBeenCalled()
    })
  })

  describe('getSidebarBounds', () => {
    test('should calculate correct bounds for right sidebar', () => {
      const display = {
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      } as any

      const bounds = getSidebarBounds(display, 'right', 400)

      expect(bounds).toEqual({
        x: 1520, // 1920 - 400
        y: 0,
        width: 400,
        height: 1080
      })
    })

    test('should calculate correct bounds for left sidebar', () => {
      const display = {
        workArea: { x: 0, y: 0, width: 1920, height: 1080 }
      } as any

      const bounds = getSidebarBounds(display, 'left', 300)

      expect(bounds).toEqual({
        x: 0,
        y: 0,
        width: 300,
        height: 1080
      })
    })
  })
})
