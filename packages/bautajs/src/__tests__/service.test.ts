/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ServiceBuilder } from '../core/service';
import { logger } from '../index';
import { OpenAPIV3Document } from '../utils/types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

const testDatasourceNoInheritanceJson = require('./fixtures/test-datasource-no-inheritance');
const testDatasourceOverrideOperationJson = require('./fixtures/test-datasource-override-operation');
const testDatasourceV2OperationsJson = require('./fixtures/test-datasource-v2-operations');
const testDatasourceJson = require('./fixtures/test-datasource');

describe('Service class tests', () => {
  describe('Create service test', () => {
    test('should create a new service with the given operations', () => {
      const apiDefinitions = [
        { info: { ...testApiDefinitionsJson[0].info, version: 'v1' }, ...testApiDefinitionsJson[0] }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );

      expect(testService.v1).toBeDefined();
      expect(testService.v1.operation1).toBeDefined();
    });
    test('operations should inheritance from API versions and new operation version should not be froozen', async () => {
      const fn1 = () => 'bender';
      const fn1V2 = () => [
        {
          id: 13,
          name: 'pet'
        },
        {
          id: 45,
          name: 'pet2'
        }
      ];
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );

      testService.v1.operation1.setup(p => p.push(fn1));
      testService.v2.operation1.setup(p => p.push(fn1V2));

      expect(await testService.v2.operation1.run({ req: {}, res: {} })).toEqual([
        {
          id: 13,
          name: 'pet'
        },
        {
          id: 45,
          name: 'pet2'
        }
      ]);
    });

    test('operations should inheritance from API versions', async () => {
      const fn1 = () => [
        {
          id: 13,
          name: 'pet'
        },
        {
          id: 45,
          name: 'pet2'
        }
      ];
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );
      testService.v1.operation1.setup(p => p.push(fn1));
      const ctx = { req: {}, res: {} };

      expect(await testService.v1.operation1.run(ctx)).toEqual(
        await testService.v2.operation1.run(ctx)
      );
    });

    test('operations should not inheritance from API versions if the operation is set to not inherit', async () => {
      const fn1 = () => [
        {
          id: 13,
          name: 'pet'
        },
        {
          id: 45,
          name: 'pet2'
        }
      ];
      const fn2 = () => [
        {
          id: 345,
          name: 'pe34t'
        },
        {
          id: 656,
          name: 'pet342'
        }
      ];
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceNoInheritanceJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );

      testService.v2.operation1.setup(p => p.push(fn2));
      testService.v1.operation1.setup(p => p.push(fn1));
      const ctx = { req: {}, res: {} };

      expect(await testService.v2.operation1.run(ctx)).not.toEqual(
        await testService.v1.operation1.run(ctx)
      );
    });

    test('operations should be added in the corresponding api version if versionId is set on the operation', async () => {
      const fn1 = () => 'bender';
      const fn1V2 = () => 'benderV2';
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceV2OperationsJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );
      testService.v1.test.setup(p => p.push(fn1));
      testService.v2.testV2.setup(p => p.push(fn1V2));
      const ctx = { req: {}, res: {} };

      expect(await testService.v1.test.run(ctx)).toEqual('bender');
      expect(await testService.v2.test.run(ctx)).toEqual('bender');
      expect(await testService.v2.testV2.run(ctx)).toEqual('benderV2');
      expect(testService.v1.testV2).toBeUndefined();
    });

    test('operations should be added in the corresponding api version if versionId is overrided on the operation', async () => {
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceOverrideOperationJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );
      testService.v1.test.setup(p => p.push(() => 1));
      testService.v2.test.setup(p => p.push(() => 3));
      const ctx = { req: {}, res: {} };

      expect(await testService.v1.test.run(ctx)).not.toEqual(await testService.v2.test.run(ctx));
    });
  });

  describe('Inheritance between operation versions', () => {
    test('Should inherit the steps between versions if the declarations are in order', async () => {
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );
      const ctx = { req: {}, res: {} };
      const fn1 = () => 5;
      const fn1V2 = (previous: any) => previous + 10;

      testService.v1.operation1.setup(p => p.push(fn1));
      testService.v2.operation1.setup(p => p.push(fn1V2));

      expect(await testService.v2.operation1.run(ctx)).toEqual(15);
    });
    test('Should no inherit the steps between versions if the operation is set to no inheritance', async () => {
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceNoInheritanceJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );
      const ctx = { req: {}, res: {} };
      const fn1 = (prev: any) => (prev ? prev + 1 : 1);
      const fn1V2 = () => 2;

      testService.v2.operation1.setup(p => p.push(fn1V2));
      testService.v1.operation1.setup(p => p.push(fn1));

      expect(await testService.v2.operation1.run(ctx)).toEqual(2);
    });

    test('Should inherit between three levels of versions', async () => {
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v3' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );

      const fn1V1 = (prev: any) => prev + 10;
      const fn1V2 = () => 5;
      const fn1V3 = (prev: any) => prev + 5;

      testService.v2.operation1.setup(p => p.push(fn1V2));
      testService.v1.operation1.setup(p => p.push(fn1V1));
      testService.v3.operation1.setup(p => p.push(fn1V3));
      const ctx = { req: {}, res: {} };

      expect(await testService.v3.operation1.run(ctx)).toEqual(20);
    });

    test('Should inherit with a complex API structure of steps', async () => {
      const apiDefinitions = [
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v1' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v2' },
          validateRequest: false,
          validateResponse: false
        },
        {
          ...testApiDefinitionsJson[0],
          info: { ...testApiDefinitionsJson[0].info, version: 'v3' },
          validateRequest: false,
          validateResponse: false
        }
      ] as OpenAPIV3Document[];
      const testService = ServiceBuilder.create(
        'testService',
        testDatasourceJson.services.testService,
        apiDefinitions,
        {},
        { services: {}, logger, apiDefinitions: [] }
      );

      const fn1V1 = () => 1;
      const fn = (prev: any) => prev + 1;

      testService.v1.operation1.setup(p => p.push(fn1V1));
      testService.v2.operation1.setup(p => p.push(fn));
      testService.v2.operation1.setup(p => p.push(fn));
      testService.v3.operation1.setup(p => p.push(fn));
      testService.v1.operation1.setup(p => p.push(fn));
      testService.v3.operation1.setup(p => p.push(fn));
      testService.v1.operation1.setup(p => p.push(fn));
      const ctx = { req: {}, res: {} };

      expect(await testService.v1.operation1.run(ctx)).toEqual(3);
      expect(await testService.v2.operation1.run(ctx)).toEqual(5);
      expect(await testService.v3.operation1.run(ctx)).toEqual(7);
    });
  });
});
