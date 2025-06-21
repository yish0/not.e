import { jest } from '@jest/globals'

// Electron 테스트 환경 설정
global.console = {
  ...console,
  // 테스트 중 불필요한 로그 출력 억제 (에러는 유지)
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error
}

// 환경 변수 설정
process.env.NODE_ENV = 'test'
process.env.JEST_WORKER_ID = '1'

// 타임아웃 설정
jest.setTimeout(10000)

// 파일 시스템 모킹을 위한 임시 디렉토리 설정
export const TEST_TEMP_DIR = '/tmp/not-e-test'
