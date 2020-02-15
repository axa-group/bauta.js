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
/* global expect, describe, test */
const Version = require('../../core/Version');
const Step = require('../../core/Step');
const Operation = require('../../core/Operation');
const { services } = require('../fixtures/test-datasource.json');
const [testApiDefinition] = require('../fixtures/test-api-definitions.json');

describe('Version class tests', () => {
  describe('Version.addOperation tests', () => {
    test('should throw an error if the name is equals to the version name', () => {
      const testVersion = new Version('v1');
      const expected = new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', v1 and operationIds`
      );

      expect(() => testVersion.addOperation('v1')).toThrow(expected);
    });

    test('should throw an error if the name is equals to "operationNames', () => {
      const testVersion = new Version('v1');
      const expected = new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', v1 and operationIds`
      );

      expect(() => testVersion.addOperation('operationIds')).toThrow(expected);
    });

    test('should throw an error if the name is equals to "addOperation', () => {
      const testVersion = new Version('v1');
      const expected = new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', v1 and operationIds`
      );

      expect(() => testVersion.addOperation('addOperation')).toThrow(expected);
    });

    test('should throw an error if the name is equals to "addMiddleware', () => {
      const testVersion = new Version('v1');
      const expected = new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', v1 and operationIds`
      );

      expect(() => testVersion.addOperation('addOperation')).toThrow(expected);
    });
  });

  describe('Version.push tests', () => {
    test('should add and step to all the operations of the version', () => {
      const testVersion = new Version('v1');
      const mwFn = () => 'someMw';
      testVersion.operationIds = ['a', 'b'];
      testVersion.a = new Operation(
        'operation1',
        [],
        services.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      testVersion.b = new Operation(
        'operation1',
        [],
        services.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      testVersion.push(mwFn);

      expect(testVersion.a.steps).toEqual([new Step(mwFn)]);
      expect(testVersion.b.steps).toEqual([new Step(mwFn)]);
    });
  });
});
