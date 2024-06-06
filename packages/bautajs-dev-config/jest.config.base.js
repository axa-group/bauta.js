module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest/presets/default-esm',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/fixtures/'],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  coverageReporters: ['lcov', 'text'],
  testResultsProcessor: 'jest-sonar-reporter',
  coverageDirectory: './coverage/',
  collectCoverageFrom: ['**/*.ts', '!**/node_modules/**', '!**/coverage/**', '!**/jest.config.js'],
  coveragePathIgnorePatterns: ['dist', 'benchmark'],
  collectCoverage: true,
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '../bautajs-dev-config/tsconfig.test.json',
        diagnostics: false
      }
    ]
  },
  testTimeout: 30000
};
