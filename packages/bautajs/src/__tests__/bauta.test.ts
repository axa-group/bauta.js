/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the 'License'); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global expect, describe, test, jest, beforeEach, afterEach */
// eslint-disable-next-line no-unused-vars
import fastSafeStringify from 'fast-safe-stringify';
import glob from 'glob';
import nock from 'nock';
import path from 'path';
import { BautaJS } from '../bauta';
import { OpenAPIV3Document } from '../utils/types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

const globSync = glob.sync;

describe('Core tests', () => {
  describe('Express initialization tests', () => {
    test('should initialize the core with the given parameters', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
        dataSourceStatic: config
      });
      expect(bautaJS.services.testService.v1.operation1).toBeDefined();
    });

    test('should initialize the core with the given api versions', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(
        [
          testApiDefinitionsJson[0],
          {
            ...testApiDefinitionsJson[0],
            ...testApiDefinitionsJson[0],
            info: { version: 'v2', title: '1' }
          }
        ] as OpenAPIV3Document[],
        {
          dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
          dataSourceStatic: config
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
          // @ts-ignore
          new BautaJS([{}], {
            dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
            dataSourceStatic: config
          })
      ).toThrow(`Invalid API definitions, "" should have required property 'swagger'`);
    });

    test('should throw en error for a not valid datasource', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(
        () =>
          new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
            dataSourcesPath: './fixtures/not-valid.json',
            dataSourceStatic: config
          })
      ).toThrow(`Invalid or not found dataSources, "" should have required property '.services'`);
    });

    test('should throw en error for a not valid operation', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(
        () =>
          new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
            dataSourcesPath: path.resolve(__dirname, './fixtures/not-valid-operation.json'),
            dataSourceStatic: config
          })
      ).toThrow(`Operation id is a mandatory parameter on test`);
    });

    test('should load the datasources from the ./fixtures path', () => {
      // @ts-ignore
      glob.sync = jest.fn(() => ({
        forEach(fn: any) {
          return fn(path.resolve(__dirname, './fixtures/test-datasource.json'));
        }
      }));
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourceStatic: config
      });

      glob.sync = globSync;

      // On build the explorer the app.use is used to expose the swagger explorer
      expect(bautaJS.services.testService.v1.operation1).toBeDefined();
    });

    test('should load the datasources from the ./fixtures path even if is a js function', () => {
      // @ts-ignore
      glob.sync = jest.fn(() => ({
        forEach(fn: any) {
          return fn(path.resolve(__dirname, './fixtures/test-datasource.json'));
        }
      }));
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourceStatic: config
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
    test('should validate the request by ./fixtures', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
        dataSourceStatic: config
      });

      try {
        await bautaJS.services.testService.v1.operation1.run({ req, res });
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

      const bautaJS = new BautaJS(
        [{ ...testApiDefinitionsJson[0], validateRequest: false }] as OpenAPIV3Document[],
        {
          dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
          resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
          dataSourceStatic: config
        }
      );

      expect(await bautaJS.services.testService.v1.operation1.run({ req, res })).toEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should validate the request and print the stack object', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
        dataSourceStatic: config
      });

      try {
        await bautaJS.services.testService.v1.operation1.run({ req, res });
      } catch (e) {
        expect(e.stack).toEqual(`${e.name}: ${e.message} \n ${fastSafeStringify(e, undefined, 2)}`);
      }
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        dataSourceStatic: config
      });

      bautaJS.services.testService.v1.operation1.setup(p =>
        p.push(() => ({
          id: 1,
          name: 'pety'
        }))
      );

      try {
        await bautaJS.services.testService.v1.operation1.run({ req, res });
      } catch (e) {
        expect(e.errors).toEqual([
          {
            errorCode: 'type.openapi.responseValidation',
            message: 'response should be array'
          }
        ]);
        expect(e.response).toEqual({
          id: 1,
          name: 'pety'
        });
      }
    });

    test('should format the validation error to string', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 123
        }
      };
      const res = {};

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        dataSourceStatic: config
      });

      bautaJS.services.testService.v1.operation1.setup(p => p.push(() => [{ id: '22' }]));

      try {
        await bautaJS.services.testService.v1.operation1.run({ req, res });
      } catch (e) {
        expect(e.stack).toEqual(`${e.name}: ${e.message} \n ${fastSafeStringify(e, undefined, 2)}`);
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

      const bautaJS = new BautaJS(
        [{ ...testApiDefinitionsJson[0], validateResponse: false }] as OpenAPIV3Document[],
        {
          dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
          resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
          dataSourceStatic: config
        }
      );

      await bautaJS.services.testService.v1.operation1.run({ req, res });
      expect(await bautaJS.services.testService.v1.operation1.run({ req, res })).toEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        dataSourceStatic: config
      });

      expect(await bautaJS.services.testService.v1.operation1.run({ req: {}, res: {} })).toEqual([
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource.json'),
        resolversPath: [
          path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
          path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver-1.js')
        ],
        dataSourceStatic: config
      });

      expect(await bautaJS.services.testService.v1.operation1.run({ req: {}, res: {} })).toEqual([
        {
          id: 132,
          name: 'pet1'
        }
      ]);
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as OpenAPIV3Document[], {
        dataSourcesPath: path.resolve(__dirname, './fixtures/test-datasource-two-operations.json'),
        resolversPath: path.resolve(
          __dirname,
          './fixtures/test-resolvers/global-utils-resolver.js'
        ),
        dataSourceStatic: config,
        servicesWrapper: services => ({
          operation2Wrap: async (previousValue: any, ctx: any) => {
            const res1 = await services.testService.v1.operation2.run(ctx);

            return [...res1, ...previousValue];
          }
        })
      });

      expect(await bautaJS.services.testService.v1.operation1.run({ req: {}, res: {} })).toEqual([
        { id: 424, name: 'pet5' },
        { id: 132, name: 'pet1' }
      ]);
    });
  });
});
