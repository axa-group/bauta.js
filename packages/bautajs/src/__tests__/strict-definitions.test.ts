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
import { getStrictDefinition } from '../utils/strict-definitions';
import apiDefinitionNotUsedSchemaSwagger2Json from './fixtures/api-definition-not-used-schema-swagger2.json';
import apiDefinitionNotUsedSchemaJson from './fixtures/api-definition-not-used-schema.json';

describe('Strict definition test', () => {
  test('should remove the not used schemas', () => {
    const result = getStrictDefinition(apiDefinitionNotUsedSchemaJson as any);

    expect(
      result.components && result.components.schemas && result.components.schemas.notUsedSchema
    ).toBeUndefined();
  });

  test('should remove the not used tags', () => {
    const result = getStrictDefinition(apiDefinitionNotUsedSchemaJson as any);
    const quoteTag = result.tags && result.tags.find((tag: any) => tag.name === 'quotes');
    expect(quoteTag).toBeUndefined();
  });

  test('should remove the not used schema for swagger v2', () => {
    const result = getStrictDefinition(apiDefinitionNotUsedSchemaSwagger2Json as any);
    expect(result.definitions && result.definitions.notUsedSchema).toBeUndefined();
  });

  test('should take in account the responses and parameters on components', () => {
    const result = getStrictDefinition(apiDefinitionNotUsedSchemaJson as any);

    expect(
      result.components && result.components.schemas && result.components.schemas.Error
    ).toBeInstanceOf(Object);

    expect(
      result.components && result.components.schemas && result.components.schemas.DocumentId
    ).toBeInstanceOf(Object);
  });
});
