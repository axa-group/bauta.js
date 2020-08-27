import Ajv from 'ajv';
import AjvOai from 'ajv-oai';

import crypto from 'crypto';

import {
  Validator,
  RouteSchema,
  Dictionary,
  CustomValidationFormat,
  JSONSchema,
  LocationError
} from '../types';
import { cleanId, removeCircularReferences, getDefaultStatusCode } from './validator-utils';
import { ValidationError } from '../core/validation-error';

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

export class AjvValidator implements Validator<Ajv.ValidateFunction> {
  private validators: Dictionary<Dictionary<Ajv.ValidateFunction> | Ajv.ValidateFunction> = {};

  private cache: any;

  private ajv: Ajv.Ajv;

  constructor(private readonly customValidationFormats?: CustomValidationFormat[]) {
    this.cache = AjvValidator.buildCache();
    this.ajv = AjvValidator.buildAjv(this.cache);
    this.addCustomFormats(this.customValidationFormats);
  }

  private static buildCache(): any {
    const cache: any = new Map();
    cache.put = cache.set; // why?
    return cache;
  }

  private static buildAjv(cache: any) {
    const ajv = new AjvOai({
      // disable ajv logs until issue #165 can be released
      logger: false,
      unknownFormats: 'ignore',
      coerceTypes: false,
      useDefaults: true,
      removeAdditional: true,
      allErrors: true,
      nullable: true,
      schemaId: 'auto',
      cache,
      metaSchema: 'json-schema-draft-07'
    });

    return ajv;
  }

  private addCustomFormats(customValidationFormats?: CustomValidationFormat[]): void {
    const addCustomFormat = ({ name, ...customValidationFormat }: CustomValidationFormat) =>
      this.ajv.addFormat(name, customValidationFormat);
    if (Array.isArray(customValidationFormats)) {
      customValidationFormats.forEach(addCustomFormat);
    }
  }

  buildSchemaCompiler(schema: JSONSchema): Ajv.ValidateFunction {
    const cleanSchema = removeCircularReferences(schema);
    if (cleanSchema.$id) {
      const compiledSchema = this.ajv.getSchema(cleanSchema.$id);
      if (compiledSchema) {
        return compiledSchema;
      }
      this.ajv.addSchema(cleanSchema);
    } else {
      Object.assign(cleanSchema, { $id: crypto.randomBytes(16).toString('hex') });
      this.ajv.addSchema(cleanSchema);
    }

    cleanId(cleanSchema);

    return this.ajv.compile(cleanSchema);
  }

  generate(
    operationSchema: RouteSchema
  ): Dictionary<Dictionary<Ajv.ValidateFunction> | Ajv.ValidateFunction> {
    if (operationSchema.body) {
      this.validators[bodySchema.toString()] = this.buildSchemaCompiler(operationSchema.body);
    }
    if (operationSchema.querystring) {
      this.validators[querystringSchema.toString()] = this.buildSchemaCompiler(
        operationSchema.querystring
      );
    }
    if (operationSchema.params) {
      this.validators[paramsSchema.toString()] = this.buildSchemaCompiler(operationSchema.params);
    }
    if (operationSchema.headers) {
      this.validators[headersSchema.toString()] = this.buildSchemaCompiler(operationSchema.headers);
    }
    if (operationSchema.response) {
      this.validators[responseSchema.toString()] = Object.keys(operationSchema.response).reduce(
        (acc: Dictionary<Ajv.ValidateFunction>, statusCode: string) => {
          if (operationSchema.response && operationSchema.response[statusCode]) {
            acc[statusCode] = this.buildSchemaCompiler(operationSchema.response[statusCode]);
          }
          return acc;
        },
        {}
      );
    }

    return this.validators;
  }

  private static validateParam(
    validators: Ajv.ValidateFunction,
    request: any,
    paramName: string
  ): ValidationError | null {
    const isValid = validators ? validators(request[paramName]) : true;
    if (isValid === false) {
      return new ValidationError(
        'The request was not valid',
        formatLocationErrors(validators.errors, paramName) || [],
        422
      );
    }

    return null;
  }

  validateRequest(/* context: Dictionary<Ajv.ValidateFunction>, */ request: any): void {
    const context = this.validators as Dictionary<Ajv.ValidateFunction>;
    const errorParams = AjvValidator.validateParam(
      context[paramsSchema.toString()],
      request,
      'params'
    );
    if (errorParams) {
      throw errorParams;
    }
    const errorBody = AjvValidator.validateParam(context[bodySchema.toString()], request, 'body');
    if (errorBody) {
      throw errorBody;
    }
    const errorQuery = AjvValidator.validateParam(
      context[querystringSchema.toString()],
      request,
      'query'
    );
    if (errorQuery) {
      throw errorQuery;
    }
    const errorHeaders = AjvValidator.validateParam(
      context[headersSchema.toString()],
      request,
      'headers'
    );
    if (errorHeaders) {
      throw errorHeaders;
    }
  }

  validateResponse(response: any, statusCode?: number | string): void {
    const context = this.validators as Dictionary<Dictionary<Ajv.ValidateFunction>>;
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
}

export default AjvValidator;
