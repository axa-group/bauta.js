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
/* global expect, describe, test */
const Version = require('../../lib/core/Version');
const { defaultLoader } = require('../../lib/utils');
const Step = require('../../lib/core/Step');
const Operation = require('../../lib/core/Operation');

describe('Version class tests', () => {
  describe('Version.addOperation tests', () => {
    test('should throw an error if the name is equals to the version name', () => {
      const testVersion = new Version('v1');
      const expected = new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', v1 and operationNames`
      );

      expect(() => testVersion.addOperation('v1')).toThrow(expected);
    });

    test('should throw an error if the name is equals to "operationNames', () => {
      const testVersion = new Version('v1');
      const expected = new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', v1 and operationNames`
      );

      expect(() => testVersion.addOperation('operationNames')).toThrow(expected);
    });

    test('should throw an error if the name is equals to "addOperation', () => {
      const testVersion = new Version('v1');
      const expected = new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', v1 and operationNames`
      );

      expect(() => testVersion.addOperation('addOperation')).toThrow(expected);
    });

    test('should throw an error if the name is equals to "addMiddleware', () => {
      const testVersion = new Version('v1');
      const expected = new Error(
        `Can not create an operation with the reserved names, 'addOperation', 'addMiddleware', v1 and operationNames`
      );

      expect(() => testVersion.addOperation('addOperation')).toThrow(expected);
    });
  });

  describe('Version.addMiddleware tests', () => {
    test('should add middleware to all the operations of the version', () => {
      const testVersion = new Version('v1');
      const mwFn = () => 'someMw';
      testVersion.operationNames = ['a', 'b'];
      testVersion.a = new Operation(
        [defaultLoader],
        {},
        {},
        {
          serviceName: 'testService'
        }
      );

      testVersion.b = new Operation(
        [defaultLoader],
        {},
        {},
        {
          serviceName: 'testService'
        }
      );

      testVersion.addMiddleware(mwFn);

      expect(testVersion.a.steps).toEqual([
        new Step(mwFn, 'middleware'),
        new Step(defaultLoader, 'loader')
      ]);
      expect(testVersion.b.steps).toEqual([
        new Step(mwFn, 'middleware'),
        new Step(defaultLoader, 'loader')
      ]);
    });
  });
});
