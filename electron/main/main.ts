import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { isDev, APP_ROOT } from '../config'
import { getShortcutManager } from './shortcuts'
import { getAllDefaultActions } from './actions'

let mainWindow: BrowserWindow | null = null
const shortcutManager = getShortcutManager()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/preload.js')
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()

    if (isDev) {
      mainWindow?.webContents.openDevTools()
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(join(APP_ROOT, 'build/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 윈도우별 로컬 단축키 등록
  shortcutManager.setupWindow(mainWindow)
}

app.whenReady().then(async () => {
  // 단축키 시스템 초기화
  await shortcutManager.initialize()
  
  // 기본 액션들 등록
  registerDefaultActions()
  
  // 전역 단축키 등록
  await shortcutManager.setupGlobalShortcuts()
  
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 기본 액션들을 일괄 등록하는 함수
function registerDefaultActions(): void {
  const actions = getAllDefaultActions()
  actions.forEach(action => {
    shortcutManager.registerAction(action.name, action.handler, action.description, action.category)
  })
  console.log(`Registered ${actions.length} default actions`)
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('get-platform', () => {
  return process.platform
})
