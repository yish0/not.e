import { FileAppConfigRepository } from '../../vault/repositories/app-config-repository'
import type { AppConfig, ToggleSettings } from '../../vault/types/vault-types'

let configRepository: FileAppConfigRepository | null = null

/**
 * 앱 설정 리포지토리를 반환합니다
 */
function getConfigRepository(): FileAppConfigRepository {
  if (!configRepository) {
    configRepository = new FileAppConfigRepository()
  }
  return configRepository
}

/**
 * 윈도우 모드를 설정합니다
 */
export async function setWindowMode(mode: 'normal' | 'toggle'): Promise<void> {
  try {
    const repository = getConfigRepository()
    const config = await repository.load()
    config.windowMode = mode
    await repository.save(config)

    // TODO: 단축키 재등록 로직 추가
    console.log(`Window mode set to: ${mode}`)
  } catch (error) {
    console.error('Failed to save window mode setting:', error)
    throw error
  }
}

/**
 * 토글 설정을 업데이트합니다
 */
export async function setToggleSettings(settings: ToggleSettings): Promise<void> {
  try {
    const repository = getConfigRepository()
    const config = await repository.load()
    config.toggleSettings = settings
    await repository.save(config)

    // TODO: 단축키 재등록 로직 추가
    console.log(`Toggle settings updated:`, settings)
  } catch (error) {
    console.error('Failed to save toggle settings:', error)
    throw error
  }
}

/**
 * 현재 윈도우 모드를 반환합니다
 */
export async function getWindowMode(): Promise<'normal' | 'toggle'> {
  try {
    const repository = getConfigRepository()
    const config = await repository.load()
    return config.windowMode
  } catch (error) {
    console.warn('Failed to load window mode:', error)
    return 'normal'
  }
}

/**
 * 현재 토글 설정을 반환합니다
 */
export async function getToggleSettings(): Promise<ToggleSettings> {
  try {
    const repository = getConfigRepository()
    const config = await repository.load()
    return (
      config.toggleSettings || {
        toggleType: 'standard',
        sidebarPosition: 'right',
        sidebarWidth: 400
      }
    )
  } catch (error) {
    console.warn('Failed to load toggle settings:', error)
    return {
      toggleType: 'standard',
      sidebarPosition: 'right',
      sidebarWidth: 400
    }
  }
}

/**
 * 전체 앱 설정을 반환합니다
 */
export async function getAppConfig(): Promise<AppConfig> {
  try {
    const repository = getConfigRepository()
    return await repository.load()
  } catch (error) {
    console.warn('Failed to load app config:', error)
    throw error
  }
}

// Legacy functions for backward compatibility
/**
 * @deprecated Use setWindowMode instead
 */
export async function setCrossDesktopToggleEnabled(enabled: boolean): Promise<void> {
  await setWindowMode(enabled ? 'toggle' : 'normal')
}

/**
 * @deprecated Use getWindowMode instead
 */
export async function getCrossDesktopToggleEnabled(): Promise<boolean> {
  const mode = await getWindowMode()
  return mode === 'toggle'
}
