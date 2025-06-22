import { BrowserWindow, screen } from 'electron'
import { FileAppConfigRepository } from '../../vault/repositories/app-config-repository'

let configRepository: FileAppConfigRepository | null = null

/**
 * 크로스 데스크탑 토글 모드가 활성화되어 있는지 확인합니다
 */
async function isCrossDesktopToggleEnabled(): Promise<boolean> {
  try {
    if (!configRepository) {
      configRepository = new FileAppConfigRepository()
    }
    const config = await configRepository.load()
    return config.enableCrossDesktopToggle ?? false
  } catch (error) {
    console.warn('Failed to load config for toggle mode:', error)
    return false
  }
}

/**
 * 크로스 데스크탑 토글 모드를 설정합니다
 */
export async function setCrossDesktopToggleEnabled(enabled: boolean): Promise<void> {
  try {
    if (!configRepository) {
      configRepository = new FileAppConfigRepository()
    }
    const config = await configRepository.load()
    config.enableCrossDesktopToggle = enabled
    await configRepository.save(config)
  } catch (error) {
    console.error('Failed to save toggle mode setting:', error)
    throw error
  }
}

/**
 * 현재 크로스 데스크탑 토글 모드 상태를 반환합니다
 */
export async function getCrossDesktopToggleEnabled(): Promise<boolean> {
  return isCrossDesktopToggleEnabled()
}

/**
 * 유효한 타겟 윈도우를 찾습니다
 */
export function findTargetWindow(window: BrowserWindow | null): BrowserWindow | null {
  if (window && !window.isDestroyed()) return window
  
  const allWindows = BrowserWindow.getAllWindows()
  return allWindows.find((w) => !w.isDestroyed()) || null
}

/**
 * 현재 커서가 있는 디스플레이의 작업 영역을 반환합니다
 */
export function getCurrentWorkArea(): Electron.Display['workArea']  {
  const cursorPoint = screen.getCursorScreenPoint()
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint)
  return currentDisplay.workArea
}


/**
 * 현재 디스플레이의 작업 영역을 기준으로 윈도우를 복원합니다
 * 윈도우가 현재 디스플레이의 작업 영역에 맞게 위치하도록 조정합니다
 */
export function restoreWindowOnCurrentDisplay(window: BrowserWindow): void {
  const workArea = getCurrentWorkArea()
  if (!workArea) {
    console.warn('No valid work area found for current display.')
    return
  }
  const windowBounds = window.getBounds()
  const newX = Math.max(workArea.x, Math.min(workArea.x + workArea.width - windowBounds.width, windowBounds.x))
  const newY = Math.max(workArea.y, Math.min(workArea.y + workArea.height - windowBounds.height, windowBounds.y))
  window.setPosition(newX, newY)
}

/**
 * 윈도우를 현재 커서가 있는 디스플레이의 중앙에 배치합니다
 */
export function centerWindowOnCurrentDisplay(window: BrowserWindow): void {
  const workArea = getCurrentWorkArea()
  if (!workArea) {
    console.warn('No valid work area found for current display.')
    return
  }
  const windowBounds = window.getBounds()
  
  const centerX = workArea.x + Math.floor((workArea.width - windowBounds.width) / 2)
  const centerY = workArea.y + Math.floor((workArea.height - windowBounds.height) / 2)
  
  window.setPosition(centerX, centerY)
}


/**
 * 윈도우를 표시하고 포커스합니다 (필요시 복원 및 위치 조정)
 * 크로스 데스크탑 토글이 활성화된 경우 현재 활성화된 데스크탑에서 윈도우를 표시합니다
 */
export async function showWindow(window: BrowserWindow): Promise<void> {
  if (window.isMinimized()) window.restore()
  
  const isCrossDesktopEnabled = await isCrossDesktopToggleEnabled()
  
  if (process.platform === 'darwin' && isCrossDesktopEnabled) {
    // 크로스 데스크탑 모드: 커서 위치 기반으로 현재 디스플레이를 찾고 윈도우를 그 위치로 이동
    const { x, y } = screen.getCursorScreenPoint()
    const currentDisplay = screen.getDisplayNearestPoint({ x, y })
    
    // 윈도우를 숨기고 현재 디스플레이의 중앙으로 직접 이동
    window.hide()
    
    const windowBounds = window.getBounds()
    const centerX = currentDisplay.workArea.x + Math.floor((currentDisplay.workArea.width - windowBounds.width) / 2)
    const centerY = currentDisplay.workArea.y + Math.floor((currentDisplay.workArea.height - windowBounds.height) / 2)
    
    window.setPosition(centerX, centerY)
    
    // 지연 후 표시하여 현재 데스크탑에서 나타나도록 함
    setTimeout(() => {
      window.setVisibleOnAllWorkspaces(false)
      window.show()
      window.focus()
    }, 100)
  } else {
    // 기본 모드: 일반적인 윈도우 표시
    centerWindowOnCurrentDisplay(window)
    window.show()
    window.focus()
  }
}

/**
 * 윈도우를 현재 데스크탑에서 완전히 숨깁니다 (데스크탑 고정 해제)
 * 크로스 데스크탑 토글이 활성화된 경우에만 특별한 숨김 동작을 수행합니다
 */
async function hideFromCurrentDesktop(window: BrowserWindow): Promise<void> {
  const isCrossDesktopEnabled = await isCrossDesktopToggleEnabled()
  
  if (process.platform === 'darwin' && isCrossDesktopEnabled) {
    try {
      // 크로스 데스크탑 모드: 모든 워크스페이스에서 보이게 한 후 숨기면 데스크탑 고정이 해제됨
      window.setVisibleOnAllWorkspaces(true)
      window.hide()
    } catch (error) {
      console.warn('Failed to hide from current desktop:', error)
      window.hide()
    }
  } else {
    // 기본 모드: 일반적인 숨김
    window.hide()
  }
}

/**
 * 윈도우의 가시성을 토글합니다
 */
export async function toggleWindowVisibility(window: BrowserWindow): Promise<void> {
  if (window.isVisible() && window.isFocused()) {
    await hideFromCurrentDesktop(window)
  } else {
    await showWindow(window)
  }
}