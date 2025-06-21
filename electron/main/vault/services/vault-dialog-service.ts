import { dialog, BrowserWindow, OpenDialogOptions } from 'electron'
import { VaultDialogService } from '../interfaces'

export class ElectronVaultDialogService implements VaultDialogService {
  
  async showSelectionDialog(window?: BrowserWindow): Promise<string | null> {
    const options: OpenDialogOptions = {
      title: 'Select Vault Location',
      message: 'Choose a folder for your notes vault',
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Select Vault'
    }

    const result = window 
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)

    if (result.canceled || !result.filePaths[0]) {
      return null
    }

    return result.filePaths[0]
  }

  async showCreateDialog(window?: BrowserWindow): Promise<{path: string, name: string} | null> {
    // 먼저 디렉토리 선택
    const options: OpenDialogOptions = {
      title: 'Choose Location for New Vault',
      message: 'Select where to create your new vault',
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Choose Location'
    }

    const pathResult = window 
      ? await dialog.showOpenDialog(window, options)
      : await dialog.showOpenDialog(options)

    if (pathResult.canceled || !pathResult.filePaths[0]) {
      return null
    }

    // 추후 vault 이름을 입력받는 다이얼로그를 추가할 수 있음
    // 현재는 폴더명을 vault 이름으로 사용
    const selectedPath = pathResult.filePaths[0]
    const folderName = selectedPath.split('/').pop() || selectedPath.split('\\').pop() || 'My Vault'
    
    return {
      path: selectedPath,
      name: folderName
    }
  }
}