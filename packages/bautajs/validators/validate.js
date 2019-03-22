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
const Ajv = require('ajv');
const crypto = require('crypto');

const ajv = new Ajv();

/**
 * Get the validator for one schema. If the schema was already stored in cache,
 * then it contains an unique identifier that is the key for the cache. If the
 * schema does not contains an unique identifier, then one is generated and set,
 * the schema is compiled, and the result of the compilation is cached.
 * @ignore
 * @param {Object} schema - the json schema to get the validator
 * @returns {Function} Validation function object for this schema
 */
function getValidator(schema) {
  if (schema.$id) {
    return ajv.getSchema(schema.$id);
  }
  /* eslint-disable-next-line no-param-reassign */
  const id = crypto.randomBytes(16).toString('hex');
  Object.assign(schema, { $id: id });
  ajv.addSchema(schema);
  const result = ajv.compile(schema);

  return result;
}

/**
 * Validate the given json with the given schema using Ajv @see https://github.com/epoberezkin/ajv
 * @ignore
 * @function validate
 * @param {Object} json - the json to validate
 * @param {Object} schema - the json schema to use @see http://json-schema.org
 * @returns {Object} the given error information @see https://github.com/epoberezkin/ajv#validation-errors
 */
function validate(json, schema) {
  const validation = getValidator(schema);
  validation(json);
  return validation.errors;
}

module.exports = validate;
