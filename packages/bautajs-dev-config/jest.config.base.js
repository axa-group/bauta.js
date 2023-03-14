module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/fixtures/'],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  coverageReporters: ['lcov', 'text'],
  testResultsProcessor: 'jest-sonar-reporter',
  coverageDirectory: './coverage/',
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**', '!**/coverage/**', '!**/jest.config.js'],
  coveragePathIgnorePatterns: ['dist', 'benchmark'],
  collectCoverage: true,
  globals: {
    'ts-jest': {
      tsconfig: '../bautajs-dev-config/tsconfig.test.json',
      diagnostics: false
    }
  },
  testTimeout: 30000
};
