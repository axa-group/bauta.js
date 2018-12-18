/*
 * Copyright (c) 2018 AXA Shared Services Spain S.A.
 *
 * Licensed under the MyAXA inner-source License (the "License");
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
/* global expect, describe, test, jest, beforeEach, afterEach */
// eslint-disable-next-line no-unused-vars
const nock = require('nock');
const glob = require('glob');
const path = require('path');
const testApiDefinitions = require('../fixtures/test-api-definitions.json');
const bautaJS = require('../../bauta');

const globSync = glob.sync;

describe('Core tests', () => {
  describe('Express initialization tests', () => {
    beforeEach(() => {
      bautaJS.initialized = false;
    });
    test('should initialize the core with the given parameters', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      bautaJS(config, testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json')
      });

      expect(bautaJS.services.testService.v1.test).toBeDefined();
    });

    test('should initialize the core with the given api versions', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      bautaJS(config, [testApiDefinitions[0], { ...testApiDefinitions[0], versionId: 'v2' }], {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json')
      });

      expect(bautaJS.services.testService.v1.test).toBeDefined();
      expect(bautaJS.services.testService.v2.test).toBeDefined();
    });

    test('should throw an error if is already initialized', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      bautaJS(config, [testApiDefinitions[0], { ...testApiDefinitions[0], versionId: 'v2' }], {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json')
      });

      expect(() =>
        bautaJS(config, [testApiDefinitions[0], { ...testApiDefinitions[0], versionId: 'v2' }], {
          dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json')
        })
      ).toThrowError('Wait a minute, you already initialized BautaJS (ノ・∀・)ノ');
    });

    test('should throw an error for a not valid testApi definition', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(() =>
        bautaJS(config, [{ versionId: 'v1' }], {
          dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json')
        })
      ).toThrowError(`Invalid API definitions, "[0]" should have required property 'info'`);
    });

    test('should throw en erro for a not valid datasource', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(() =>
        bautaJS(config, testApiDefinitions, {
          dataSourcesPath: '../fixtures/not-valid.json'
        })
      ).toThrowError(
        'Invalid or not found dataSources, "" should NOT have fewer than 1 properties'
      );
    });

    test('should throw an error for a not valid config', () => {
      const config = null;
      const expected = new Error(
        'Invalid or not found config. Config object must be a valid JSON object.'
      );

      expect(() =>
        bautaJS(config, testApiDefinitions, {
          dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json')
        })
      ).toThrow(expected);
    });

    test('should load the datasources from the default path', () => {
      glob.sync = jest.fn(() => ({
        forEach(fn) {
          return fn(path.resolve(__dirname, '../fixtures/test-datasource.json'));
        }
      }));
      const config = {
        endpoint: 'http://google.es'
      };

      bautaJS(config, testApiDefinitions);

      glob.sync = globSync;

      // On build the explorer the app.use is used to expose the swagger explorer
      expect(bautaJS.services.testService.v1.test).toBeDefined();
    });

    test('should load the datasources from the default path even if is a js function', () => {
      glob.sync = jest.fn(() => ({
        forEach(fn) {
          return fn(path.resolve(__dirname, '../fixtures/test-datasource.json'));
        }
      }));
      const config = {
        endpoint: 'http://google.es'
      };

      bautaJS(config, testApiDefinitions);

      glob.sync = globSync;

      // On build the explorer the app.use is used to expose the swagger explorer
      expect(bautaJS.services.testService.v1.test).toBeDefined();
    });
  });

  describe('Load loaders from path', () => {
    beforeEach(() => {
      bautaJS.initialized = false;
      nock('https://google.com')
        .persist()
        .get('/')
        .reply(200, {
          bender: 'benderGoogle'
        });
    });
    afterEach(() => {
      nock.cleanAll();
    });
    test('should load the loaders from the given path', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      bautaJS(config, testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        loadersPath: path.resolve(__dirname, '../fixtures/myaxa-loaders/test-operation-loader.js')
      });

      expect(await bautaJS.services.testService.v1.test.exec({})).toEqual('benderTest');
    });

    test('should load the loaders from the given array of paths', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      bautaJS(config, testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        loadersPath: [
          path.resolve(__dirname, '../fixtures/myaxa-loaders/test-operation-loader.js'),
          path.resolve(__dirname, '../fixtures/myaxa-loaders/test-operation-loader-1.js')
        ]
      });

      expect(await bautaJS.services.testService.v1.test.exec({})).toEqual('benderTest1');
      expect(bautaJS.services.testService.v1.test.steps.length).toEqual(3);
    });
  });
});
