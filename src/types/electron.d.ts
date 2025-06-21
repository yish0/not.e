export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  getPlatform: () => Promise<NodeJS.Platform>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
