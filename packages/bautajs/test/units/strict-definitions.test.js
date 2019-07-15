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
/* global expect, describe, test */
// eslint-disable-next-line no-unused-vars
const strictDefinitions = require('../../utils/strict-definitions');

describe('Strict definition test', () => {
  test('should remove the not used schemas', () => {
    const apiDefinitionWithNotUsedSchema = require('../fixtures/api-definition-not-used-schema.json');

    const result = strictDefinitions(apiDefinitionWithNotUsedSchema);

    expect(result.components.schemas.notUsedSchema).toBeUndefined();
  });

  test('should remove the not used tags', () => {
    const apiDefinitionWithNotUsedSchema = require('../fixtures/api-definition-not-used-schema.json');

    const result = strictDefinitions(apiDefinitionWithNotUsedSchema);
    const quoteTag = result.tags.find(tag => tag.name === 'quotes');
    expect(quoteTag).toBeUndefined();
  });

  test('should remove the not used schema for swagger v2', () => {
    const apiDefinitionWithNotUsedSchema = require('../fixtures/api-definition-not-used-schema-swagger2.json');

    const result = strictDefinitions(apiDefinitionWithNotUsedSchema);
    expect(result.definitions.notUsedSchema).toBeUndefined();
  });

  test('should resolve reference for extra components references', () => {
    const apiWithComponents = require('../fixtures/api-definition-with-components.json');

    const result = strictDefinitions(apiWithComponents);

    expect(result.components.responses['304'].description).toEqual('Not modified');
    expect(result.components.schemas.Error.required).toEqual(['code', 'message']);
  });
});
