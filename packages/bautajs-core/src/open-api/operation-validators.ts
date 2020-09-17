import Ajv from 'ajv';
import { Dictionary, LocationError, OperationValidators } from '../types';
import { ValidationError } from '../core/validation-error';
import {
  getDefaultStatusCode,
  bodySchema,
  querystringSchema,
  paramsSchema,
  responseSchema,
  headersSchema
} from './validator-utils';

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

export class AJVOperationValidators implements OperationValidators {
  constructor(
    private validators: Dictionary<Dictionary<Ajv.ValidateFunction> | Ajv.ValidateFunction>
  ) {}

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

  validateRequest(request: any): void {
    const context = this.validators as Dictionary<Ajv.ValidateFunction>;
    const errorParams = AJVOperationValidators.validateParam(
      context[paramsSchema.toString()],
      request,
      'params'
    );
    if (errorParams) {
      throw errorParams;
    }
    const errorBody = AJVOperationValidators.validateParam(
      context[bodySchema.toString()],
      request,
      'body'
    );
    if (errorBody) {
      throw errorBody;
    }
    const errorQuery = AJVOperationValidators.validateParam(
      context[querystringSchema.toString()],
      request,
      'query'
    );
    if (errorQuery) {
      throw errorQuery;
    }
    const errorHeaders = AJVOperationValidators.validateParam(
      context[headersSchema.toString()],
      request,
      'headers'
    );
    if (errorHeaders) {
      throw errorHeaders;
    }
  }

  validateResponseSchema(response: any, statusCode?: number | string): void {
    const context = this.validators as Dictionary<Dictionary<Ajv.ValidateFunction>>;
    const validate = (
      schemaValidators: Dictionary<Ajv.ValidateFunction>
    ): ValidationError | null => {
      const status = statusCode || getDefaultStatusCode(schemaValidators);
      const isValid =
        schemaValidators && schemaValidators[status] ? schemaValidators[status](response) : null;

      if (isValid === false) {
        throw new ValidationError(
          'Internal error',
          formatLocationErrors(schemaValidators[status].errors, 'response') || [],
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
