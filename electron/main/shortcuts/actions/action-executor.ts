import type { BrowserWindow } from 'electron'
import type { ActionExecutor, ShortcutAction } from '../types/shortcut-types'

export class DefaultActionExecutor implements ActionExecutor {
  private actions: Map<string, ShortcutAction> = new Map()

  async executeAction(actionName: string, window: BrowserWindow | null): Promise<void> {
    const action = this.actions.get(actionName)
    if (!action) {
      console.warn(`Unknown action: ${actionName}`)
      return
    }

    try {
      await action.handler(window)
    } catch (error) {
      console.error(`Error executing action ${actionName}:`, error)
    }
  }

  registerAction(action: ShortcutAction): void {
    this.actions.set(action.name, action)
    console.log(`Action registered: ${action.name} (${action.category})`)
  }

  hasAction(actionName: string): boolean {
    return this.actions.has(actionName)
  }

  getActions(): ShortcutAction[] {
    return Array.from(this.actions.values())
  }

  getActionsByCategory(category: string): ShortcutAction[] {
    return Array.from(this.actions.values()).filter((action) => action.category === category)
  }

  unregisterAction(actionName: string): boolean {
    const result = this.actions.delete(actionName)
    if (result) {
      console.log(`Action unregistered: ${actionName}`)
    }
    return result
  }
}
