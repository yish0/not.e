import { contextBridge, ipcRenderer } from 'electron'

export interface ToggleSettings {
  toggleType: 'sidebar' | 'standard'
  sidebarPosition?: 'left' | 'right'
  sidebarWidth?: number
}

export interface AppConfig {
  currentVault?: string
  recentVaults: any[]
  showVaultSelector: boolean
  lastUsedVault?: string
  windowMode: 'normal' | 'toggle'
  toggleSettings?: ToggleSettings
  enableCrossDesktopToggle?: boolean
}

export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  getPlatform: () => Promise<NodeJS.Platform>
  
  // New window mode API
  getWindowMode: () => Promise<'normal' | 'toggle'>
  setWindowMode: (mode: 'normal' | 'toggle') => Promise<void>
  getToggleSettings: () => Promise<ToggleSettings>
  setToggleSettings: (settings: ToggleSettings) => Promise<void>
  getAppConfig: () => Promise<AppConfig>
  
  // Legacy API (deprecated)
  getCrossDesktopToggleEnabled: () => Promise<boolean>
  setCrossDesktopToggleEnabled: (enabled: boolean) => Promise<void>
}

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // New window mode API
  getWindowMode: () => ipcRenderer.invoke('get-window-mode'),
  setWindowMode: (mode: 'normal' | 'toggle') => ipcRenderer.invoke('set-window-mode', mode),
  getToggleSettings: () => ipcRenderer.invoke('get-toggle-settings'),
  setToggleSettings: (settings: ToggleSettings) => ipcRenderer.invoke('set-toggle-settings', settings),
  getAppConfig: () => ipcRenderer.invoke('get-app-config'),
  
  // Legacy API (deprecated)
  getCrossDesktopToggleEnabled: () => ipcRenderer.invoke('get-cross-desktop-toggle-enabled'),
  setCrossDesktopToggleEnabled: (enabled: boolean) =>
    ipcRenderer.invoke('set-cross-desktop-toggle-enabled', enabled)
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
