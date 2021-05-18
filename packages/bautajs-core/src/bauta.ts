/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Licensed under the AXA Group Operations Spain S.A. License (the "License");
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
import fastGlob from 'fast-glob';
import { resolve } from 'path';
import { OpenAPIV2 } from 'openapi-types';
import { OperationBuilder } from './core/operation';
import { defaultLogger } from './default-logger';
import {
  Options,
  BautaJSInstance,
  BautaJSOptions,
  Document,
  Logger,
  Operations,
  BasicOperation,
  // CustomFormat,
  Validator
} from './types';
import { isLoggerValid } from './utils/logger-validator';
import Parser from './open-api/parser';
import { decorate } from './utils/decorate';
import { AjvValidator } from './open-api/ajv-validator';

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
    throw new Error(`The OpenAPI API definition provided is not valid. Error ${e.message}`);
  }
}

/**
 *
 * @export
 * @class BautaJS
 * @implements {BautaJSBuilder}
 * @template TRaw Initial data sent to the operation.run method
 * @param {Document[]} apiDefinitions
 * @param {BautaJSOptions<TRaw>} [options={}]
 * @example
 * const BautaJS = require('@bautajs/core');
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
export class BautaJS<TRaw = any> implements BautaJSInstance {
  public readonly apiDefinition?: Document;

  public operations: Operations = {};

  public readonly staticConfig: any;

  public readonly logger: Logger;

  public readonly options: Options<TRaw>;

  public readonly validator: Validator<any>;

  private bootstrapped: boolean = false;

  constructor({
    apiDefinition,
    staticConfig,
    logger,
    enableRequestValidation,
    enableResponseValidation,
    customValidationFormats,
    resolversPath,
    resolvers,
    validatorOptions,
    ...options
  }: BautaJSOptions<TRaw> = {}) {
    const api = apiDefinition ? prebuildApi(apiDefinition) : undefined;
    let responseValidation = false;
    let requestValidation = true;

    this.apiDefinition = apiDefinition;
    this.staticConfig = staticConfig;
    this.options = options;

    this.logger = logger || defaultLogger();
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

    // Load custom resolvers and operations modifiers
    if (resolvers) {
      resolvers.forEach(resolver => {
        resolver(this.operations);
      });
    } else {
      BautaJS.requireAll<[Operations]>(
        resolversPath || './server/resolvers/**/*resolver.js',
        true,
        [this.operations]
      );
    }
  }

  private logBautaOptions(): void {
    this.logger.debug(
      `Bauta started with the options disableTruncateLog=${this.options.disableTruncateLog}, truncateLogSize=${this.options.truncateLogSize}`
    );
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
          this.logger.warn(
            `OpenAPI specification operation ID ${route.operationId} don't have a resolver.`
          );
        }
      });
    }

    this.logBautaOptions();

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
    const operations: Operations = new Proxy(
      {},
      {
        has(target, key) {
          return Reflect.has(target, key);
        },
        ownKeys(target) {
          return Reflect.ownKeys(target);
        },
        get(target: Operations, prop: string, receiver) {
          if (!Object.prototype.hasOwnProperty.call(target, prop)) {
            const operation = createOperation(prop);
            Object.defineProperty(target, prop, {
              value: operation,
              writable: false,
              enumerable: true,
              configurable: false
            });
          }
          return Reflect.get(target, prop, receiver);
        }
      }
    );
    return operations;
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
   * const { requireAll } = require('@bautajs/core');
   *
   * const files = requireAll('./my/path/to/datasources/*.js', true, {someVar:123});
   */
  static requireAll<T>(folder: string | string[], execute: boolean = true, vars?: T) {
    const execFiles = (folderPath: string) => {
      const result: any = [];
      fastGlob.sync(folderPath).forEach((file: string) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        let data = require(resolve(file));
        if (data.default) {
          data = data.default;
        }
        if (typeof data === 'function' && execute === true) {
          data = Array.isArray(vars) ? data(...vars) : data(vars);
        }

        result.push(data);
      });

      return result;
    };

    let files = [];
    if (Array.isArray(folder)) {
      files = folder.map(folderPath => execFiles(folderPath));
    } else {
      files = execFiles(folder);
    }

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
