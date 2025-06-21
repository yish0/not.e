import { globalShortcut } from 'electron'
import type { GlobalShortcutManager, ActionExecutor } from '../types'

export class ElectronGlobalShortcutManager implements GlobalShortcutManager {
  private registeredShortcuts: Map<string, string> = new Map() // key -> action
  private actionExecutor: ActionExecutor

  constructor(actionExecutor: ActionExecutor) {
    this.actionExecutor = actionExecutor
  }

  register(key: string, action: string): boolean {
    if (this.isRegistered(key)) {
      console.warn(`Global shortcut ${key} is already registered`)
      return false
    }

    if (!this.actionExecutor.hasAction(action)) {
      console.error(`Action ${action} is not registered`)
      return false
    }

    try {
      const success = globalShortcut.register(key, () => {
        this.actionExecutor.executeAction(action, null)
      })

      if (success) {
        this.registeredShortcuts.set(key, action)
        console.log(`Global shortcut registered: ${key} -> ${action}`)
      } else {
        console.warn(`Failed to register global shortcut: ${key}`)
      }

      return success
    } catch (error) {
      console.error(`Error registering global shortcut ${key}:`, error)
      return false
    }
  }

  unregister(key: string): boolean {
    if (!this.isRegistered(key)) {
      console.warn(`Global shortcut ${key} is not registered`)
      return false
    }

    try {
      globalShortcut.unregister(key)
      this.registeredShortcuts.delete(key)
      console.log(`Global shortcut unregistered: ${key}`)
      return true
    } catch (error) {
      console.error(`Error unregistering global shortcut ${key}:`, error)
      return false
    }
  }

  unregisterAll(): void {
    try {
      globalShortcut.unregisterAll()
      this.registeredShortcuts.clear()
      console.log('All global shortcuts unregistered')
    } catch (error) {
      console.error('Error unregistering all global shortcuts:', error)
    }
  }

  isRegistered(key: string): boolean {
    return this.registeredShortcuts.has(key)
  }

  getRegisteredShortcuts(): string[] {
    return Array.from(this.registeredShortcuts.keys())
  }

  getActionForKey(key: string): string | undefined {
    return this.registeredShortcuts.get(key)
  }
}
