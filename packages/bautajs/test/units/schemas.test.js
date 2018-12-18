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
const { deref } = require('../../lib/schemas');
const definitions = require('../fixtures/definitions.json');

describe('Helpers tests', () => {
  describe('deref function tests', () => {
    test('should deref a json schema with the definitions', () => {
      const jsonSchema = require('../fixtures/json-schema.json');
      const deRefJsonSchema = require('../fixtures/deref-json-schema.json');
      expect(deref(jsonSchema, definitions)).toEqual(deRefJsonSchema);
    });

    test('should prevent circular json schema', () => {
      const deRefCircularJsonSchema = require('../fixtures/deref-circular-json-schema.json');
      const circularJsonSchema = require('../fixtures/circular-json-schema.json');
      expect(deref(circularJsonSchema, definitions)).toEqual(deRefCircularJsonSchema);
    });
  });
});
