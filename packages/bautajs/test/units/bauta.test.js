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
/* global expect, describe, test, jest, beforeEach, afterEach */
// eslint-disable-next-line no-unused-vars
const nock = require('nock');
const glob = require('glob');
const path = require('path');
const testApiDefinitions = require('../fixtures/test-api-definitions.json');
const BautaJS = require('../../bauta');

const globSync = glob.sync;

describe('Core tests', () => {
  describe('Express initialization tests', () => {
    test('should initialize the core with the given parameters', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        dataSourceCtx: config
      });
      expect(bautaJS.services.testService.v1.operation1).toBeDefined();
    });

    test('should initialize the core with the given api versions', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(
        [
          testApiDefinitions[0],
          {
            ...testApiDefinitions[0],
            ...testApiDefinitions[0],
            info: { version: 'v2' }
          }
        ],
        {
          dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
          dataSourceCtx: config
        }
      );

      expect(bautaJS.services.testService.v1.operation1).toBeDefined();
      expect(bautaJS.services.testService.v2.operation1).toBeDefined();
    });

    test('should throw an error for a not valid testApi definition', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(
        () =>
          new BautaJS([{}], {
            dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
            dataSourceCtx: config
          })
      ).toThrowError(`Invalid API definitions, "" should have required property 'swagger'`);
    });

    test('should throw en error for a not valid datasource', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(
        () =>
          new BautaJS(testApiDefinitions, {
            dataSourcesPath: '../fixtures/not-valid.json',
            dataSourceCtx: config
          })
      ).toThrowError(
        `Invalid or not found dataSources, "" should have required property '.services'`
      );
    });

    test('should throw en error for a not valid operation', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(
        () =>
          new BautaJS(testApiDefinitions, {
            dataSourcesPath: path.resolve(__dirname, '../fixtures/not-valid-operation.json'),
            dataSourceCtx: config
          })
      ).toThrowError(`Operation id is a mandatory parameter on test`);
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

      const bautaJS = new BautaJS(testApiDefinitions, {
        dataSourceCtx: config
      });

      glob.sync = globSync;

      // On build the explorer the app.use is used to expose the swagger explorer
      expect(bautaJS.services.testService.v1.operation1).toBeDefined();
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

      const bautaJS = new BautaJS(testApiDefinitions, {
        dataSourceCtx: config
      });

      glob.sync = globSync;

      // On build the explorer the app.use is used to expose the swagger explorer
      expect(bautaJS.services.testService.v1.operation1).toBeDefined();
    });
  });

  describe('Validate request globally', () => {
    beforeEach(() => {
      nock('https://google.com')
        .persist()
        .get('/')
        .reply(200, [
          {
            id: 1,
            name: 'pety'
          }
        ]);
    });
    afterEach(() => {
      nock.cleanAll();
    });
    test('should validate the request by default', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};

      const bautaJS = new BautaJS(testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        dataSourceCtx: config
      });

      try {
        await bautaJS.services.testService.v1.operation1.exec(req, res);
      } catch (e) {
        expect(e.errors).toEqual([
          {
            errorCode: 'type.openapi.validation',
            location: 'query',
            message: 'should be integer',
            path: 'limit'
          }
        ]);
      }
    });

    test('should not validate the request if set validateRequest to false', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};

      const bautaJS = new BautaJS([{ ...testApiDefinitions[0], validateRequest: false }], {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        dataSourceCtx: config
      });

      await bautaJS.services.testService.v1.operation1.exec(req, res);
      expect(await bautaJS.services.testService.v1.operation1.exec(req, res)).toEqual([
        {
          id: 1,
          name: 'pety'
        }
      ]);
    });
  });

  describe('Validate response globally', () => {
    beforeEach(() => {
      nock('https://google.com')
        .persist()
        .get('/')
        .reply(200, {
          id: 1,
          name: 'pety'
        });
    });
    afterEach(() => {
      nock.cleanAll();
    });
    test('should validate the response by default', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 123
        }
      };
      const res = {};

      const bautaJS = new BautaJS(testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        dataSourceCtx: config
      });

      try {
        await bautaJS.services.testService.v1.operation1.exec(req, res);
      } catch (e) {
        expect(e.errors).toEqual([
          { errorCode: 'type.openapi.responseValidation', message: 'response should be array' }
        ]);
        expect(e.response).toEqual({
          id: 1,
          name: 'pety'
        });
      }
    });

    test('should not validate the response if set validateResponse to false', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 123
        }
      };
      const res = {};

      const bautaJS = new BautaJS([{ ...testApiDefinitions[0], validateResponse: false }], {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        dataSourceCtx: config
      });

      await bautaJS.services.testService.v1.operation1.exec(req, res);
      expect(await bautaJS.services.testService.v1.operation1.exec(req, res)).toEqual({
        id: 1,
        name: 'pety'
      });
    });
  });

  describe('Load resolvers from path', () => {
    beforeEach(() => {
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
    test('should load the operations from the given path', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        resolversPath: path.resolve(
          __dirname,
          '../fixtures/test-resolvers/test-operation-resolver.js'
        ),
        dataSourceCtx: config
      });

      expect(await bautaJS.services.testService.v1.operation1.exec({})).toEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should load the resolvers from the given array of paths', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource.json'),
        resolversPath: [
          path.resolve(__dirname, '../fixtures/test-resolvers/test-operation-resolver.js'),
          path.resolve(__dirname, '../fixtures/test-resolvers/test-operation-resolver-1.js')
        ],
        dataSourceCtx: config
      });

      expect(await bautaJS.services.testService.v1.operation1.exec({})).toEqual([
        {
          id: 132,
          name: 'pet1'
        }
      ]);
      expect(bautaJS.services.testService.v1.operation1.steps.length).toEqual(2);
    });
  });

  describe('Set global utils', () => {
    beforeEach(() => {
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
    test('should load the operations from the given path', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitions, {
        dataSourcesPath: path.resolve(__dirname, '../fixtures/test-datasource-two-operations.json'),
        resolversPath: path.resolve(
          __dirname,
          '../fixtures/test-resolvers/global-utils-test-resolver.js'
        ),
        dataSourceCtx: config,
        servicesWrapper: services => ({
          operation2Wrap: async (previousValue, ctx) => {
            const res1 = await services.testService.v1.operation2.exec(ctx.req, ctx.res);

            return [...res1, ...previousValue];
          }
        })
      });

      expect(await bautaJS.services.testService.v1.operation1.exec({})).toEqual([
        { id: 424, name: 'pet5' },
        { id: 132, name: 'pet1' }
      ]);
    });
  });
});
