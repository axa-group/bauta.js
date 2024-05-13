import fastGlob from 'fast-glob';
import { resolve } from 'node:path';
import { OpenAPIV2 } from 'openapi-types';
import { OperationBuilder } from './core/operation.js';
import { defaultLogger } from './default-logger.js';
import {
  BautaJSInstance,
  BautaJSOptions,
  Document,
  Logger,
  Operations,
  BasicOperation,
  Validator
} from './types.js';
import { isLoggerValid } from './utils/logger-validator.js';
import Parser from './open-api/parser.js';
import { decorate } from './utils/decorate.js';
import { AjvValidator } from './open-api/ajv-validator.js';

interface API {
  version: string;
  operations: BasicOperation[];
}

function prebuildApi(apiDefinition: Document): API {
  try {
    return {
      version: apiDefinition.info?.version,
      operations: Object.keys(apiDefinition.paths)
        .map(path => {
          const pathItem = apiDefinition.paths[path];
          if (pathItem) {
            return Object.keys(pathItem)
              .filter(method => pathItem[method as OpenAPIV2.HttpMethods]?.operationId)
              .map(method => ({
                // Typescript do not get the filter done before, due to that we need the casting
                id: (pathItem[method as OpenAPIV2.HttpMethods] as OpenAPIV2.OperationObject)
                  .operationId as string,
                deprecated: pathItem[method as OpenAPIV2.HttpMethods]?.deprecated || false
              }));
          }
          return [];
        })
        .flat(1)
    };
  } catch (e) {
    throw new Error(
      `The OpenAPI API definition provided is not valid. Error ${(e as Error).message}`
    );
  }
}

/**
 *
 * @export
 * @class BautaJS
 * @implements {BautaJSBuilder}
 * @template TRaw Initial data sent to the operation.run method
 * @param {Document[]} apiDefinitions
 * @param {BautaJSOptions} [options={}]
 * @example
 * const BautaJS = require('@axa/bautajs-core');
 * const apiDefinition = require('./open-api-definition.json');
 * const static = {
 *   someProp: 'someVal'
 * };
 *
 * const bautaJS = new BautaJS({
 *  apiDefinition,
 *  resolversPath:  './resolvers/*-resolver.js',
 *  staticConfig: static,
 * });
 *
 * // Assuming we setup an operationId called 'find' we can run the following code:
 * await bautaJS.operations.find.run({});
 */
export class BautaJS implements BautaJSInstance {
  public readonly apiDefinition?: Document;

  public operations: Operations = {};

  public readonly staticConfig: any;

  public readonly logger: Logger;

  public readonly validator: Validator<any>;

  private bootstrapped = false;

  constructor({
    apiDefinition,
    staticConfig,
    logger,
    enableRequestValidation,
    enableResponseValidation,
    customValidationFormats,
    resolversPath,
    resolvers,
    validatorOptions
  }: BautaJSOptions = {}) {
    const api = apiDefinition ? prebuildApi(apiDefinition) : undefined;
    let responseValidation = false;
    let requestValidation = true;

    this.apiDefinition = apiDefinition;
    this.staticConfig = staticConfig;

    this.logger = logger || defaultLogger('@axa/bautajs-core');

    if (!isLoggerValid(this.logger)) {
      throw new Error(
        'Logger is not valid. Must be compliant with basic logging levels(trace, debug, info, warn, error, fatal)'
      );
    }

    if (typeof enableRequestValidation === 'boolean') {
      requestValidation = enableRequestValidation;
    }

    if (typeof enableResponseValidation === 'boolean') {
      responseValidation = enableResponseValidation;
    }

    this.validator = new AjvValidator(customValidationFormats, validatorOptions);
    this.operations = this.registerOperations(requestValidation, responseValidation, api);
    (async () => {
      // Load custom resolvers and operations modifiers
      if (resolvers) {
        resolvers.forEach(resolver => {
          resolver(this.operations);
        });
      } else {
        await BautaJS.requireAll<[Operations]>(
          resolversPath || './server/resolvers/**/*resolver.js',
          true,
          [this.operations]
        );
      }
    })();
  }

  public async bootstrap(): Promise<void> {
    if (this.bootstrapped === true) {
      throw new Error('The instance has already being bootstrapped.');
    }
    if (this.apiDefinition) {
      const parser = new Parser(this.logger);
      const parsedApiDefinition = await parser.asyncParse(this.apiDefinition);
      parsedApiDefinition.routes.forEach(route => {
        if (Object.prototype.hasOwnProperty.call(this.operations, route.operationId)) {
          this.operations[route.operationId].addRoute(route);
        } else {
          this.logger.debug(
            `OpenAPI specification operation ID ${route.operationId} don't have a resolver.`
          );
        }
      });
    }

    // This will prevent to create new operations after bootstrapping the bautajs instance.
    this.operations = Object.freeze(
      Object.entries(this.operations).reduce((acc: Operations, [key, val]) => {
        acc[key] = val;

        return acc;
      }, {})
    );
    this.bootstrapped = true;
  }

  public decorate(property: string | symbol, value: any, dependencies?: string[]) {
    decorate(this, property, value, dependencies);
    return this;
  }

  private registerOperations(
    enableRequestValidation: boolean,
    enableResponseValidation: boolean,
    api?: API
  ): Operations {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    function createOperation(operationId: string) {
      const operationSchema = api?.operations.find(op => op.id === operationId);
      const operation = OperationBuilder.create(operationId, self);
      operation.validateResponse(enableResponseValidation);
      operation.validateRequest(enableRequestValidation);

      if (operationSchema?.deprecated === true) {
        operation.setAsDeprecated();
      }

      self.logger.info(`[OK] ${operation.id} operation registered on bautajs.`);
      return operation;
    }

    // With Reflect we can access to the properties of the proxied object.
    return new Proxy(
      {},
      {
        has(target, key) {
          return Reflect.has(target, key);
        },
        ownKeys(target) {
          return Reflect.ownKeys(target);
        },
        get(target: Operations, operationId: string, receiver) {
          if (!Object.prototype.hasOwnProperty.call(target, operationId)) {
            const operation = createOperation(operationId);
            Object.defineProperty(target, operationId, {
              value: operation,
              writable: false,
              enumerable: true,
              configurable: false
            });
          }
          return Reflect.get(target, operationId, receiver);
        }
      }
    );
  }

  /**
   * Require a bunch of files that matches the given [glob](https://github.com/isaacs/node-glob) path.
   * @static
   * @template T
   * @param {(string | string[])} folder
   * @param {boolean} [execute=true]
   * @param {T} [vars]
   * @returns
   * @memberof BautaJS
   * @example
   * const { requireAll } = require('@axa/bautajs-core');
   *
   * const files = requireAll('./my/path/to/datasources/*.js', true, {someVar:123});
   */
  static async requireAll<T>(folder: string | string[], execute = true, vars?: T) {
    console.log('we at the start of requireAll');
    const execFiles = async (folderPath: string) => {
      console.log('we at the start of execFiles');
      const result: any = [];
      const files = await fastGlob.async(folderPath.replace(/\\/g, '/'));

      console.log('files', files);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        let data = await import(resolve(file));
        console.log('data from import', data);
        // console.log('data from require toString', data?.toString());
        console.log('data default from require toString', data?.default.toString());
        if (data.default) {
          console.log('habemus default');
          data = data.default;
        }
        if (typeof data === 'function' && execute === true) {
          console.log('habemus function');
          data = Array.isArray(vars) ? data(...vars) : data(vars);
        }

        result.push(data);
      }

      console.log('we at the end of execFiles', result);

      return result;
    };

    let files = [];
    if (Array.isArray(folder)) {
      for (let i = 0; i < folder.length; i++) {
        const folderPath = folder[i];
        files.push(await execFiles(folderPath));
      }
    } else {
      files = await execFiles(folder);
    }

    console.log('we at the end of requireAll');

    return files;
  }

  public inheritOperationsFrom(bautajsInstance: BautaJSInstance) {
    if (!(bautajsInstance instanceof BautaJS)) {
      throw new Error('A bautaJS instance must be provided.');
    }
    if (this.bootstrapped === true) {
      throw new Error('Operation inherit should be done before bootstrap the BautaJS instance.');
    }
    if (bautajsInstance.bootstrapped === false) {
      this.logger.warn(
        'The given instance is not bootstrapped, thus operation schema will be no inherited.'
      );
    }
    Object.keys(bautajsInstance.operations).forEach(operationId => {
      const operation = bautajsInstance.operations[operationId];
      if (
        operation.deprecated !== true &&
        !Object.prototype.hasOwnProperty.call(this.operations, operationId)
      ) {
        this.operations[operationId] = OperationBuilder.create(operation.id, this);
        this.operations[operationId].setup(operation.handler);
        this.operations[operationId].requestValidationEnabled = operation.requestValidationEnabled;
        this.operations[operationId].responseValidationEnabled =
          operation.responseValidationEnabled;
        if (operation.isPrivate()) {
          this.operations[operationId].setAsPrivate();
        }
        if (operation.route) {
          this.operations[operationId].addRoute(operation.route);
        }
      }
    });
    return this;
  }
}

export default BautaJS;
