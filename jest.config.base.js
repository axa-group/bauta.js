/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
 * you may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
      tsconfig: 'tsconfig.test.json',
      diagnostics: false
    }
  },
  testTimeout: 30000
};
