import { FileAppConfigRepository } from '../../vault/repositories/app-config-repository'

let configRepository: FileAppConfigRepository | null = null

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
    
    // TODO: 단축키 재등록 로직 추가
    console.log(`Cross-desktop toggle mode ${enabled ? 'enabled' : 'disabled'}`)
  } catch (error) {
    console.error('Failed to save toggle mode setting:', error)
    throw error
  }
}

/**
 * 현재 크로스 데스크탑 토글 모드 상태를 반환합니다
 */
export async function getCrossDesktopToggleEnabled(): Promise<boolean> {
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