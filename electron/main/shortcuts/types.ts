import { BrowserWindow } from 'electron'

export enum ShortcutCategory {
  GLOBAL = 'global',
  FILE = 'file',
  NAVIGATION = 'navigation',
  EDIT = 'edit',
  VIEW = 'view',
  DEV = 'dev'
}

export interface ShortcutConfig {
  key: string
  action: string
  description: string
  category: ShortcutCategory
}

export type ShortcutActionHandler = (window: BrowserWindow | null) => void | Promise<void>

export interface ShortcutAction {
  name: string
  handler: ShortcutActionHandler
  description: string
  category: ShortcutCategory
}

export interface GlobalShortcutManager {
  register(key: string, action: string): boolean
  unregister(key: string): boolean
  unregisterAll(): void
  isRegistered(key: string): boolean
  getRegisteredShortcuts(): string[]
}

export interface LocalShortcutManager {
  register(window: BrowserWindow, key: string, action: string): boolean
  unregister(window: BrowserWindow, key: string): boolean
  unregisterAll(window: BrowserWindow): void
  getRegisteredShortcuts(window: BrowserWindow): string[]
}

export interface ActionExecutor {
  executeAction(actionName: string, window: BrowserWindow | null): Promise<void>
  registerAction(action: ShortcutAction): void
  hasAction(actionName: string): boolean
}
