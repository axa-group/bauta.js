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
const traverse = require('traverse');
const isObject = require('lodash/isObject');
const get = require('lodash/get');

/**
 * Replace the $ref from the schema with the equivalent definition recursively
 * @function deref
 * @param {Object} schema - the shcema to deref
 * @param {Object} definitionsSchema - the definitions of the schema
 * @returns {Object} the given schema with the $ref replaced
 */
function deref(schema, definitionsSchema) {
  return traverse(schema).map(function loop(node) {
    // Remove circular dependecies
    if (this.circular) {
      return this.remove();
    }

    let update;
    if (node && node.$ref && typeof node.$ref === 'string') {
      const ref = node.$ref.replace('#/', '').replace('/', '.');
      const newValue = get(definitionsSchema, ref);
      if (newValue) {
        update = this.update(newValue);
      }
    }

    return update;
  });
}

/**
 * Convert the openAPI parameters json to a Ajv valid json
 * @ignore
 * @param {Object} parametersSchema - An OpenAPI parameters array
 * @param {string} parameterName - The parameter name to find,for example: body, query, formData...
 * @returns {Object} A valid Ajv json schema to validate
 */
function opiToAjv(parametersSchema = [], parameterName) {
  const formSchema = parametersSchema.filter(schema => schema.in === parameterName);
  if (formSchema.length > 0) {
    return {
      in: `custom-${parameterName}`,
      schema: {
        type: 'object',
        properties: formSchema.reduce(
          (acc, { required, ...item }) => Object.assign(acc, { [item.name]: item }),
          {}
        ),
        required: formSchema.filter(i => i.required === true).map(i => i.name)
      }
    };
  }

  return null;
}

/**
 * Get the OpenAPI schemas for the OpenAPI schema parameters. This function will deref all schema referencies
 * @ignore
 * @param {Object} operationSchema - the operation schema equivalent to swagger `path`
 * @param {Object} definitions - Your data definition for the given schema
 * @returns {Object} All the schema parameters ready to be used in Ajv validator
 */
function getOperationParametersSchema(operationSchema, definitions) {
  let parametersSchema = [];

  if (isObject(operationSchema)) {
    parametersSchema = Object.values(Object.values(operationSchema)[0])[0].parameters;
    if (parametersSchema) {
      parametersSchema = parametersSchema.map(parameter => {
        if (parameter && parameter.schema) {
          Object.assign(parameter, { schema: deref(parameter.schema, definitions) });
        }

        return parameter;
      });
    }
  }

  const formSchema = opiToAjv(parametersSchema, 'formData');
  if (formSchema) {
    parametersSchema.push(formSchema);
  }

  const querySchema = opiToAjv(parametersSchema, 'query');
  if (querySchema) {
    parametersSchema.push(querySchema);
  }

  return parametersSchema;
}

module.exports = {
  deref,
  getOperationParametersSchema
};
