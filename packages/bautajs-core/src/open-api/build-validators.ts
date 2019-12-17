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
import fastJson from 'fast-safe-stringify';
import crypto from 'crypto';
import Ajv from 'ajv';
import AjvOai from 'ajv-oai';
import { JSONSchema, LocationError, Dictionary } from '../utils/types';
import { ValidationError } from '../core/validation-error';

const cache: any = new Map();
cache.put = cache.set;
const ajv = new AjvOai({
  unknownFormats: 'ignore',
  coerceTypes: true,
  useDefaults: true,
  removeAdditional: true,
  allErrors: true,
  nullable: true,
  schemaId: 'auto',
  cache,
  metaSchema: 'json-schema-draft-07'
});
const bodySchema = Symbol('body-schema');
const querystringSchema = Symbol('querystring-schema');
const paramsSchema = Symbol('params-schema');
const responseSchema = Symbol('response-schema');
const headersSchema = Symbol('headers-schema');

function formatLocationErrors(
  errors?: Ajv.ErrorObject[] | null,
  location?: string
): LocationError[] | undefined {
  return Array.isArray(errors)
    ? errors.map(error => ({
        path: error.dataPath,
        location: location || '',
        message: error.message || '',
        errorCode: error.keyword
      }))
    : undefined;
}

function validateParam(
  validators: Ajv.ValidateFunction,
  request: any,
  paramName: string
): ValidationError | null {
  const isValid = validators ? validators(request[paramName]) : null;
  if (isValid === false) {
    return new ValidationError(
      'The request was not valid',
      formatLocationErrors(validators.errors, paramName) || [],
      400
    );
  }

  return null;
}

function validateRequest(context: Dictionary<Ajv.ValidateFunction>, request: any): void {
  const errorParams = validateParam(context[paramsSchema.toString()], request, 'params');
  if (errorParams) {
    throw errorParams;
  }
  const errorBody = validateParam(context[bodySchema.toString()], request, 'body');
  if (errorBody) {
    throw errorBody;
  }
  const errorQuery = validateParam(context[querystringSchema.toString()], request, 'query');
  if (errorQuery) {
    throw errorQuery;
  }
  const errorHeaders = validateParam(context[headersSchema.toString()], request, 'headers');
  if (errorHeaders) {
    throw errorHeaders;
  }
}

function getDefaultStatusCode(responses: any = {}) {
  return responses.default ? 'default' : 200;
}

function validateResponse(
  context: Dictionary<Dictionary<Ajv.ValidateFunction>>,
  response: any,
  statusCode?: number | string
): void {
  const validate = (validators: Dictionary<Ajv.ValidateFunction>): ValidationError | null => {
    const status = statusCode || getDefaultStatusCode(validators);
    const isValid = validators && validators[status] ? validators[status](response) : null;

    if (isValid === false) {
      throw new ValidationError(
        'Internal error',
        formatLocationErrors(validators[status].errors, 'response') || [],
        500,
        response
      );
    }

    return null;
  };
  const error = validate(context[responseSchema.toString()]);

  if (error) {
    throw error;
  }
}

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

function clearCircluar(schema: JSONSchema) {
  return JSON.parse(
    fastJson(schema, (_key, value) => {
      if (value === '[Circular]') {
        return undefined;
      }
      return value;
    })
  );
}

function buildSchemaCompiler(schema: JSONSchema): Ajv.ValidateFunction {
  const cleanSchema = clearCircluar(schema);
  if (cleanSchema.$id) {
    const compiledSchema = ajv.getSchema(cleanSchema.$id);
    if (compiledSchema) {
      return compiledSchema;
    }
    ajv.addSchema(cleanSchema);
  } else {
    Object.assign(cleanSchema, { $id: crypto.randomBytes(16).toString('hex') });
    ajv.addSchema(cleanSchema);
  }

  cleanId(cleanSchema);
  return ajv.compile(cleanSchema);
}

export {
  getDefaultStatusCode,
  validateResponse,
  validateRequest,
  buildSchemaCompiler,
  bodySchema,
  querystringSchema,
  paramsSchema,
  responseSchema,
  headersSchema
};
