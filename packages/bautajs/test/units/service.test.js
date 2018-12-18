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
const Service = require('../../lib/core/Service');
const Step = require('../../lib/core/Step');
const { defaultLoader } = require('../../lib/utils');
const testDataource = require('../fixtures/test-datasource.json');
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
        { versionId: 'v1' }
      ]);

      expect(testService.v1).toBeDefined();
      expect(testService.v1.test).toBeDefined();
    });
    test('should create a new service with no versions and operations for not defined ones', () => {
      const testService = new Service('testService');

      expect(testService.v1).toBeUndefined();
    });

    test('operations should inheritance from API versions and new operation version should not be froozen', async () => {
      const nextStep = () => 'bender';
      const nextStepV2 = () => 'benderV2';
      const testService = new Service('testService', testDataource.testService, [
        { versionId: 'v1' },
        { versionId: 'v2' }
      ]);
      testService.v1.test.next(nextStep);
      testService.v2.test.next(nextStepV2);

      expect(await testService.v2.test.exec({})).toEqual('benderV2');
    });

    test('operations should inheritance from API versions', async () => {
      const nextStep = () => 'bender';
      const testService = new Service('testService', testDataource.testService, [
        { versionId: 'v1' },
        { versionId: 'v2' }
      ]);
      testService.v1.test.next(nextStep);

      expect(await testService.v1.test.exec({})).toEqual(await testService.v2.test.exec({}));
    });

    test('operations should not inheritance from API versions if is on the noInheritance config', async () => {
      const nextStep = () => 'bender';
      const testService = new Service('testService', testDataource.testService, [
        { versionId: 'v1' },
        { versionId: 'v2', noInheritance: { testService: ['test'] } }
      ]);
      testService.v1.test.next(nextStep);

      expect(await testService.v2.test.exec({})).not.toEqual(await testService.v1.test.exec({}));
    });

    test('operations should be added in the corresponding api version if versionId is set on the operation', async () => {
      const nextStep = () => 'bender';
      const nextStepV2 = () => 'benderV2';
      const testService = new Service('testService', testDataourceV2Operations.testService, [
        { versionId: 'v1' },
        { versionId: 'v2' }
      ]);
      testService.v1.test.next(nextStep);
      testService.v2.testV2.next(nextStepV2);

      expect(await testService.v1.test.exec({})).toEqual('bender');
      expect(await testService.v2.test.exec({})).toEqual('bender');
      expect(await testService.v2.testV2.exec({})).toEqual('benderV2');
      expect(testService.v1.testV2).toBeUndefined();
    });

    test('operations should be added in the corresponding api version if versionId is overrided on the operation', async () => {
      const testService = new Service('testService', testDataourceOverrideOperations.testService, [
        { versionId: 'v1' },
        { versionId: 'v2' }
      ]);

      expect(await testService.v1.test.exec({})).not.toEqual(await testService.v2.test.exec({}));
    });
  });

  describe('Inheritance between operation versions', () => {
    test('Should inherit the next hooks between versions if the declarations are in order', () => {
      const testService = new Service('testService', testDataource.testService, [
        { versionId: 'v1' },
        { versionId: 'v2' }
      ]);
      const nextFunction = () => {};
      const nextFunctionV2 = () => {};

      testService.v1.test.next(nextFunction);
      testService.v2.test.next(nextFunctionV2);

      expect(testService.v2.test.steps).toEqual([
        new Step(defaultLoader, 'loader'),
        new Step(nextFunction, 'next'),
        new Step(nextFunctionV2, 'next')
      ]);
    });

    test('Should inherit the next hooks between versions no matter the order', () => {
      const testService = new Service('testService', testDataource.testService, [
        { versionId: 'v1' },
        { versionId: 'v2' }
      ]);
      const nextFunction = () => {};
      const nextFunctionV2 = () => {};

      testService.v2.test.next(nextFunctionV2);
      testService.v1.test.next(nextFunction);

      expect(testService.v2.test.steps).toEqual([
        new Step(defaultLoader, 'loader'),
        new Step(nextFunctionV2, 'next'),
        new Step(nextFunction, 'next')
      ]);
    });

    test('Should no inherit the next hooks between versions if the operation is set to no inheritance', () => {
      const testService = new Service('testService', testDataource.testService, [
        { versionId: 'v1' },
        {
          versionId: 'v2',
          noInheritance: {
            testService: ['test']
          }
        }
      ]);
      const nextFunction = () => {};
      const nextFunctionV2 = () => {};

      testService.v2.test.next(nextFunctionV2);
      testService.v1.test.next(nextFunction);

      expect(testService.v2.test.steps).toEqual([
        new Step(defaultLoader, 'loader'),
        new Step(nextFunctionV2, 'next')
      ]);
    });

    test('Should inherit between three levels of versions', () => {
      const testService = new Service('testService', testDataource.testService, [
        { versionId: 'v1' },
        {
          versionId: 'v2'
        },
        {
          versionId: 'v3'
        }
      ]);
      const nextFunction = () => {};
      const nextFunctionV2 = () => {};
      const nextFunctionV3 = () => {};

      testService.v2.test.next(nextFunctionV2);
      testService.v1.test.next(nextFunction);
      testService.v3.test.next(nextFunctionV3);

      expect(testService.v3.test.steps).toEqual([
        new Step(defaultLoader, 'loader'),
        new Step(nextFunctionV2, 'next'),
        new Step(nextFunction, 'next'),
        new Step(nextFunctionV3, 'next')
      ]);
    });

    test('Should inherit with a complex API structure of steps', () => {
      const testService = new Service('testService', testDataource.testService, [
        { versionId: 'v1' },
        { versionId: 'v2' },
        { versionId: 'v3' }
      ]);
      const nextFunctionV1 = () => {};
      const nextFunctionV2 = () => {};
      const previousFunctionV1 = () => {};
      const previousFunctionV2 = () => {};
      const loaderV3 = () => {};
      const setErrorHandlerV2 = () => {};
      const middlewareV1 = () => {};
      const middlewareV3 = () => {};

      testService.v1.test.next(nextFunctionV1);
      testService.v2.test.next(nextFunctionV2);
      testService.v2.test.previous(previousFunctionV2);
      testService.v3.test.setLoader(loaderV3);
      testService.v2.test.setErrorHandler(setErrorHandlerV2);
      testService.v1.test.addMiddleware(middlewareV1);
      testService.v3.test.addMiddleware(middlewareV3);
      testService.v1.test.previous(previousFunctionV1);

      expect(testService.v1.test.steps).toEqual([
        new Step(middlewareV1, 'middleware'),
        new Step(previousFunctionV1, 'previous'),
        new Step(defaultLoader, 'loader'),
        new Step(nextFunctionV1, 'next')
      ]);

      expect(testService.v2.test.steps).toEqual([
        new Step(middlewareV1, 'middleware'),
        new Step(previousFunctionV2, 'previous'),
        new Step(previousFunctionV1, 'previous'),
        new Step(defaultLoader, 'loader'),
        new Step(nextFunctionV1, 'next'),
        new Step(nextFunctionV2, 'next')
      ]);

      expect(testService.v3.test.steps).toEqual([
        new Step(middlewareV1, 'middleware'),
        new Step(middlewareV3, 'middleware'),
        new Step(previousFunctionV2, 'previous'),
        new Step(previousFunctionV1, 'previous'),
        new Step(loaderV3, 'loader'),
        new Step(nextFunctionV1, 'next'),
        new Step(nextFunctionV2, 'next')
      ]);
    });
  });
});
