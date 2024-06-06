import { Dictionary, Response } from '../types.js';

const unknownFormats: Dictionary<boolean> = { int32: true, int64: true };

function isObject(obj: any) {
  return typeof obj === 'object' && obj !== null;
}

export function stripResponseFormats(schema: Response): Response {
  Object.keys(schema).forEach(item => {
    if (isObject(schema[item])) {
      if (schema[item].format && unknownFormats[schema[item].format]) {
        // eslint-disable-next-line no-param-reassign
        schema[item].format = undefined;
      }
      stripResponseFormats(schema[item]);
    }
  });

  return schema;
}
