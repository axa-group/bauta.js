import fastJson from 'fast-safe-stringify';

import { JSONSchema } from '../types';

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

function getDefaultStatusCode(responses: any = {}) {
  return responses.default ? 'default' : 200;
}

export { cleanId, removeCircularReferences, getDefaultStatusCode };
