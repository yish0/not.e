/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/electron'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'electron/**/*.ts',
    '!**/__tests__/**',
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/types.ts',
    '!**/interfaces.ts'
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/electron/__tests__/setup.ts'],
  moduleNameMapper: {
    '^electron$': '<rootDir>/electron/__tests__/mocks/electron.ts'
  },
  transformIgnorePatterns: ['node_modules/(?!(electron)/)'],
  testTimeout: 10000
}
