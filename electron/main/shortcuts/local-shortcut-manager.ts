import { BrowserWindow } from 'electron'
import { LocalShortcutManager, ActionExecutor } from './types'

export class ElectronLocalShortcutManager implements LocalShortcutManager {
  private windowShortcuts: WeakMap<BrowserWindow, Map<string, string>> = new WeakMap()
  private actionExecutor: ActionExecutor

  constructor(actionExecutor: ActionExecutor) {
    this.actionExecutor = actionExecutor
  }

  register(window: BrowserWindow, key: string, action: string): boolean {
    if (!this.actionExecutor.hasAction(action)) {
      console.error(`Action ${action} is not registered`)
      return false
    }

    const shortcuts = this.getOrCreateShortcutsMap(window)
    
    if (shortcuts.has(key)) {
      console.warn(`Local shortcut ${key} is already registered for this window`)
      return false
    }

    try {
      // Electron의 before-input-event를 사용하여 로컬 단축키 등록
      const listener = (event: Electron.Event, input: Electron.Input) => {
        if (this.isShortcutMatch(input, key)) {
          event.preventDefault()
          this.actionExecutor.executeAction(action, window)
        }
      }

      window.webContents.on('before-input-event', listener)
      shortcuts.set(key, action)
      
      // 윈도우가 닫힐 때 리스너 정리
      window.once('closed', () => {
        window.webContents.removeListener('before-input-event', listener)
      })

      console.log(`Local shortcut registered: ${key} -> ${action}`)
      return true
    } catch (error) {
      console.error(`Error registering local shortcut ${key}:`, error)
      return false
    }
  }

  unregister(window: BrowserWindow, key: string): boolean {
    const shortcuts = this.windowShortcuts.get(window)
    if (!shortcuts || !shortcuts.has(key)) {
      console.warn(`Local shortcut ${key} is not registered for this window`)
      return false
    }

    shortcuts.delete(key)
    console.log(`Local shortcut unregistered: ${key}`)
    return true
  }

  unregisterAll(window: BrowserWindow): void {
    const shortcuts = this.windowShortcuts.get(window)
    if (shortcuts) {
      shortcuts.clear()
      console.log('All local shortcuts unregistered for window')
    }
  }

  getRegisteredShortcuts(window: BrowserWindow): string[] {
    const shortcuts = this.windowShortcuts.get(window)
    return shortcuts ? Array.from(shortcuts.keys()) : []
  }

  private getOrCreateShortcutsMap(window: BrowserWindow): Map<string, string> {
    let shortcuts = this.windowShortcuts.get(window)
    if (!shortcuts) {
      shortcuts = new Map()
      this.windowShortcuts.set(window, shortcuts)
    }
    return shortcuts
  }

  private isShortcutMatch(input: Electron.Input, shortcut: string): boolean {
    const keys = shortcut.toLowerCase().split('+')
    const inputKeys: string[] = []
    
    // 수정자 키 처리
    if (input.control || input.meta) {
      inputKeys.push(process.platform === 'darwin' ? 'cmd' : 'ctrl')
    }
    if (input.shift) inputKeys.push('shift')
    if (input.alt) inputKeys.push('alt')
    
    // 메인 키 추가
    if (input.key.length === 1) {
      inputKeys.push(input.key.toLowerCase())
    } else {
      // 특수 키 처리
      const specialKeys: { [key: string]: string } = {
        'F12': 'f12',
        'F1': 'f1', 'F2': 'f2', 'F3': 'f3', 'F4': 'f4',
        'F5': 'f5', 'F6': 'f6', 'F7': 'f7', 'F8': 'f8',
        'F9': 'f9', 'F10': 'f10', 'F11': 'f11',
        'Plus': 'plus',
        'Minus': 'minus',
        'Equal': '=',
        'Backslash': '\\',
        'Escape': 'escape',
        'Enter': 'enter',
        'Space': 'space',
        'Tab': 'tab'
      }
      inputKeys.push(specialKeys[input.key] || input.key.toLowerCase())
    }

    // CmdOrCtrl 처리
    const normalizedShortcut = shortcut.toLowerCase()
      .replace('cmdorctrl', process.platform === 'darwin' ? 'cmd' : 'ctrl')
      .split('+')
      .map(k => k.trim())
      .sort()
      .join('+')
    
    const normalizedInput = inputKeys.sort().join('+')
    
    return normalizedShortcut === normalizedInput
  }
}