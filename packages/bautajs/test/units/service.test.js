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
/* global expect, describe, test, beforeEach, afterEach */
const nock = require('nock');
const Service = require('../../core/Service');
const Step = require('../../core/Step');
const [testApiDefinition] = require('../fixtures/test-api-definitions.json');
const testDataource = require('../fixtures/test-datasource.json');
const testDataourceNoinheritance = require('../fixtures/test-datasource-no-inheritance.json');
const testDataourceV2Operations = require('../fixtures/test-datasource-v2-operations.json');
const testDataourceOverrideOperations = require('../fixtures/test-datasource-override-operation.json');

describe('Service class tests', () => {
  beforeEach(() => {
    nock('https://google.com')
      .persist()
      .get('/')
      .reply(200, {
        bender: 'benderGoogle'
      });

    nock('https://facebook.com')
      .persist()
      .get('/')
      .reply(200, {
        bender: 'benderFacebook'
      });
  });
  afterEach(() => {
    nock.cleanAll();
  });
  describe('constructor tests', () => {
    test('should create a new service with the given operations', () => {
      const testService = new Service('testService', testDataource.testService, [
        { info: { ...testApiDefinition.info, version: 'v1' }, ...testApiDefinition }
      ]);

      expect(testService.v1).toBeDefined();
      expect(testService.v1.operation1).toBeDefined();
    });
    test('should create a new service with no versions and operations for not defined ones', () => {
      const testService = new Service('testService');

      expect(testService.v1).toBeUndefined();
    });

    test('operations should inheritance from API versions and new operation version should not be froozen', async () => {
      const fn1 = () => 'bender';
      const fn1V2 = () => 'benderV2';
      const testService = new Service('testService', testDataource.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } }
      ]);
      testService.v1.operation1.push(fn1);
      testService.v2.operation1.push(fn1V2);

      expect(await testService.v2.operation1.exec({})).toEqual('benderV2');
    });

    test('operations should inheritance from API versions', async () => {
      const fn1 = () => 'bender';
      const testService = new Service('testService', testDataource.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } }
      ]);
      testService.v1.operation1.push(fn1);

      expect(await testService.v1.operation1.exec({})).toEqual(
        await testService.v2.operation1.exec({})
      );
    });

    test('operations should not inheritance from API versions if is on the noInheritance config', async () => {
      const fn1 = () => 'bender';
      const testService = new Service('testService', testDataourceNoinheritance.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } }
      ]);
      testService.v1.operation1.push(fn1);

      expect(await testService.v2.operation1.exec({})).not.toEqual(
        await testService.v1.operation1.exec({})
      );
    });

    test('operations should be added in the corresponding api version if versionId is set on the operation', async () => {
      const fn1 = () => 'bender';
      const fn1V2 = () => 'benderV2';
      const testService = new Service('testService', testDataourceV2Operations.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } }
      ]);
      testService.v1.test.push(fn1);
      testService.v2.testV2.push(fn1V2);

      expect(await testService.v1.test.exec({})).toEqual('bender');
      expect(await testService.v2.test.exec({})).toEqual('bender');
      expect(await testService.v2.testV2.exec({})).toEqual('benderV2');
      expect(testService.v1.testV2).toBeUndefined();
    });

    test('operations should be added in the corresponding api version if versionId is overrided on the operation', async () => {
      const testService = new Service('testService', testDataourceOverrideOperations.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } }
      ]);

      expect(await testService.v1.test.exec({})).not.toEqual(await testService.v2.test.exec({}));
    });
  });

  describe('Inheritance between operation versions', () => {
    test('Should inherit the steps between versions if the declarations are in order', () => {
      const testService = new Service('testService', testDataource.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } }
      ]);
      const fn1 = () => {};
      const fn1V2 = () => {};

      testService.v1.operation1.push(fn1);
      testService.v2.operation1.push(fn1V2);

      expect(testService.v2.operation1.steps).toEqual([new Step(fn1), new Step(fn1V2)]);
    });

    test('Should inherit the steps between versions no matter the order', () => {
      const testService = new Service('testService', testDataource.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } }
      ]);
      const fn1 = () => {};
      const fn1V2 = () => {};

      testService.v2.operation1.push(fn1V2);
      testService.v1.operation1.push(fn1);

      expect(testService.v2.operation1.steps).toEqual([new Step(fn1V2), new Step(fn1)]);
    });

    test('Should no inherit the steps between versions if the operation is set to no inheritance', () => {
      const testService = new Service('testService', testDataourceNoinheritance.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        {
          ...testApiDefinition,
          info: { ...testApiDefinition.info, version: 'v2' },
          noInheritance: {
            testService: ['operation1']
          }
        }
      ]);
      const fn1 = () => {};
      const fn1V2 = () => {};

      testService.v2.operation1.push(fn1V2);
      testService.v1.operation1.push(fn1);

      expect(testService.v2.operation1.steps).toEqual([new Step(fn1V2)]);
    });

    test('Should inherit between three levels of versions', () => {
      const testService = new Service('testService', testDataource.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v3' } }
      ]);
      const fn1V1 = () => {};
      const fn1V2 = () => {};
      const fn1V3 = () => {};

      testService.v2.operation1.push(fn1V2);
      testService.v1.operation1.push(fn1V1);
      testService.v3.operation1.push(fn1V3);

      expect(testService.v3.operation1.steps).toEqual([
        new Step(fn1V2),
        new Step(fn1V1),
        new Step(fn1V3)
      ]);
    });

    test('Should inherit with a complex API structure of steps', () => {
      const testService = new Service('testService', testDataource.testService, [
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } },
        { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v3' } }
      ]);
      const fn1V1 = () => {};
      const fn1V2 = () => {};
      const fn2V1 = () => {};
      const fn2V2 = () => {};
      const fn1V3 = () => {};
      const setErrorHandlerV2 = () => {};
      const fn3V1 = () => {};
      const fn2V3 = () => {};

      testService.v1.operation1.push(fn1V1);
      testService.v2.operation1.push(fn1V2);
      testService.v2.operation1.push(fn2V2);
      testService.v3.operation1.push(fn1V3);
      testService.v2.operation1.setErrorHandler(setErrorHandlerV2);
      testService.v1.operation1.push(fn3V1);
      testService.v3.operation1.push(fn2V3);
      testService.v1.operation1.push(fn2V1);

      expect(testService.v1.operation1.steps).toEqual([
        new Step(fn1V1),
        new Step(fn3V1),
        new Step(fn2V1)
      ]);

      expect(testService.v2.operation1.steps).toEqual([
        new Step(fn1V1),
        new Step(fn1V2),
        new Step(fn2V2),
        new Step(fn3V1),
        new Step(fn2V1)
      ]);

      expect(testService.v3.operation1.steps).toEqual([
        new Step(fn1V1),
        new Step(fn1V2),
        new Step(fn2V2),
        new Step(fn1V3),
        new Step(fn3V1),
        new Step(fn2V3),
        new Step(fn2V1)
      ]);
    });
  });
});
