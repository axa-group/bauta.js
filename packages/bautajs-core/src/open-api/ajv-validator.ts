import Ajv from 'ajv';
import AjvOai from 'ajv-oai';
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

export class AjvValidator implements Validator<Ajv.ValidateFunction> {
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

  generate(operationSchema: RouteSchema): AJVOperationValidators {
    const validators: Dictionary<Dictionary<Ajv.ValidateFunction> | Ajv.ValidateFunction> = {};

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
        (acc: Dictionary<Ajv.ValidateFunction>, statusCode: string) => {
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
