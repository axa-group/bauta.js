import Ajv, { ValidateFunction, Format, Options } from 'ajv';
import addFormats from 'ajv-formats';
import crypto from 'crypto';
import { Validator, RouteSchema, Dictionary, CustomValidationFormat, JSONSchema } from '../types';
import {
  cleanId,
  removeCircularReferences,
  bodySchema,
  querystringSchema,
  paramsSchema,
  responseSchema,
  headersSchema
} from './validator-utils';
import { AJVOperationValidators } from './operation-validators';

export class AjvValidator implements Validator<ValidateFunction> {
  private ajv: Ajv;

  constructor(
    private readonly customValidationFormats?: CustomValidationFormat[],
    validatorOptions?: Options
  ) {
    this.ajv = AjvValidator.buildAjv(validatorOptions);
    addFormats(this.ajv);
    if (this.customValidationFormats?.length) {
      this.addCustomFormats(this.customValidationFormats);
    }
  }

  private static buildAjv(validatorOptions: Options = {}) {
    const ajv = new Ajv({
      logger: false,
      strict: false,
      coerceTypes: false,
      useDefaults: true,
      removeAdditional: true,
      allErrors: true,
      ...validatorOptions
    });

    return ajv;
  }

  private addCustomFormats(customValidationFormats?: CustomValidationFormat[]): void {
    const addCustomFormat = ({ name, ...customValidationFormat }: CustomValidationFormat) =>
      this.ajv.addFormat(name, customValidationFormat as Format);
    if (Array.isArray(customValidationFormats)) {
      customValidationFormats.forEach(addCustomFormat);
    }
  }

  buildSchemaCompiler(schema: JSONSchema): ValidateFunction {
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

  generate(operationSchema: RouteSchema): AJVOperationValidators {
    const validators: Dictionary<Dictionary<ValidateFunction> | ValidateFunction> = {};

    if (operationSchema.body) {
      validators[bodySchema.toString()] = this.buildSchemaCompiler(operationSchema.body);
    }
    if (operationSchema.querystring) {
      validators[querystringSchema.toString()] = this.buildSchemaCompiler(
        operationSchema.querystring
      );
    }
    if (operationSchema.params) {
      validators[paramsSchema.toString()] = this.buildSchemaCompiler(operationSchema.params);
    }
    if (operationSchema.headers) {
      validators[headersSchema.toString()] = this.buildSchemaCompiler(operationSchema.headers);
    }
    if (operationSchema.response) {
      validators[responseSchema.toString()] = Object.keys(operationSchema.response).reduce(
        (acc: Dictionary<ValidateFunction>, statusCode: string) => {
          if (operationSchema.response && operationSchema.response[statusCode]) {
            acc[statusCode] = this.buildSchemaCompiler(operationSchema.response[statusCode]);
          }
          return acc;
        },
        {}
      );
    }

    return new AJVOperationValidators(validators);
  }
}

export default AjvValidator;
