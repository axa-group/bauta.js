import fastJson from 'fast-safe-stringify';

import { JSONSchema } from '../types';

const bodySchema = Symbol('body-schema');
const querystringSchema = Symbol('querystring-schema');
const paramsSchema = Symbol('params-schema');
const responseSchema = Symbol('response-schema');
const headersSchema = Symbol('headers-schema');

// We need to clean the ID's before compile the schema with ajv, otherwise ajv will throw an error because i$d is not
// a valid key for the schema.
function cleanId(schema: JSONSchema) {
  Object.keys(schema).forEach(key => {
    if (key === '$id') {
      // eslint-disable-next-line no-param-reassign
      delete schema[key];
    }
    if (schema[key] !== null && typeof schema[key] === 'object') {
      cleanId(schema[key]);
    }
  });
}

function removeCircularReferences(schema: JSONSchema) {
  return JSON.parse(
    fastJson(schema, (_key, value) => {
      if (value === '[Circular]') {
        return undefined;
      }
      return value;
    })
  );
}

export {
  cleanId,
  removeCircularReferences,
  bodySchema,
  querystringSchema,
  paramsSchema,
  responseSchema,
  headersSchema
};
