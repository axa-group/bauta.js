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
import OpenapiSchemaValidator, { OpenAPISchemaValidatorResult } from 'openapi-schema-validator';
import { IJsonSchema, OpenAPI, OpenAPIV2, OpenAPIV3 } from 'openapi-types';
import { resolve } from 'path';
import { OperationBuilder } from './core/operation';
import { logger } from './logger';
import { getComponents, getStrictDefinition } from './utils/strict-definitions';
import {
  Dictionary,
  BautaJSInstance,
  BautaJSOptions,
  Document,
  EventTypes,
  Logger,
  Operation,
  Operations
} from './utils/types';

const extendOpenapiSchemaJson = require('./validators/extend-openapi-schema.json');

interface SchemaCache {
  path: string;
  method: string;
  apiDefinitionIndex: number;
  operation: Operation;
}

function setDefinitionDefaults(apiDefinition: Document): Document {
  return {
    ...apiDefinition,
    validateRequest: apiDefinition.validateRequest !== false,
    validateResponse: apiDefinition.validateResponse !== false
  };
}

function parseApiDefinition(apiDefinition: Document) {
  const newApiDefinition = setDefinitionDefaults(apiDefinition);
  const apiDefinitionValidator = new OpenapiSchemaValidator({
    extensions: extendOpenapiSchemaJson as IJsonSchema,
    version: (apiDefinition as OpenAPIV3.Document).openapi ? 3 : 2
  });

  const validation = apiDefinitionValidator.validate(apiDefinition);
  if (validation.errors.length > 0) {
    throw new Error(
      `Invalid API definitions, "${
        (validation as OpenAPISchemaValidatorResult).errors[0].dataPath
      }" ${(validation as OpenAPISchemaValidatorResult).errors[0].message}`
    );
  }

  const paths: OpenAPIV3.PathsObject | OpenAPIV2.PathsObject = {};
  Object.keys(newApiDefinition.paths).forEach(path => {
    paths[path] = { ...newApiDefinition.paths[path] };
  });
  newApiDefinition.paths = paths;

  return newApiDefinition;
}

/**
 *
 * @export
 * @class BautaJS
 * @implements {BautaJSBuilder}
 * @param {Document[]} apiDefinitions
 * @param {BautaJSOptions} [options={}]
 * @example
 * const BautaJS = require('@bautajs/core');
 * const apiDefinitions = require('./open-api-definition.json');
 * const static = {
 *   someProp: 'someVal'
 * };
 *
 * const bautaJS = new BautaJS(apiDefinitions, {
 *  resolversPath:  './resolvers/*-resolver.js',
 *  dataSourceStatic: static,
 * });
 *
 * // Assuming we have an api definition with version equals to 'v1' and have an operationId called 'find' we can run the following code:
 * await bautaJS.operations.v1.find.run({});
 */
export class BautaJS implements BautaJSInstance {
  private schemaCache: SchemaCache[] = [];

  /**
   * @type {Operations}
   * @memberof BautaJS
   */
  public readonly operations: Operations = {};

  /**
   * @type {any}
   * @memberof BautaJS
   */
  public readonly staticConfig: any;

  /**
   * A debug instance logger
   * @type {Logger}
   * @memberof BautaJS
   */
  public readonly logger: Logger;

  /**
   * An array of OpenAPI definitions
   * @type {Document[]}
   * @memberof BautaJS
   */
  public readonly apiDefinitions: Document[];

  constructor(apiDefinitions: Document[], options: BautaJSOptions = {}) {
    const parsedApiDefinitions = apiDefinitions.map(parseApiDefinition);

    this.staticConfig = options.staticConfig;
    /**
     * @memberof BautaJS#
     * @property {Logger} logger - A [debug]{@link https://www.npmjs.com/package/debug} logger instance
     */
    this.logger = logger;
    this.operations = this.registerOperations(parsedApiDefinitions);

    // Load custom resolvers and operations modifiers
    if (options.resolvers) {
      options.resolvers.forEach(resolver => {
        resolver(this.operations);
      });
    } else {
      BautaJS.requireAll<[Operations]>(
        options.resolversPath || './server/resolvers/**/*resolver.js',
        true,
        [this.operations]
      );
    }

    // Filter api definitions
    this.apiDefinitions = this.filterApiDefinitions(parsedApiDefinitions);
    // Clean the cache
    this.schemaCache = [];
  }

  private filterApiDefinitions(defaultApiDefinitions: Document[]) {
    // No need to copy definitions, already done on setDefinitionDefaults
    this.schemaCache.forEach(({ path, method, operation, apiDefinitionIndex }) => {
      if (operation.isPrivate()) {
        // eslint-disable-next-line
        delete defaultApiDefinitions[apiDefinitionIndex].paths[path][method];
        if (Object.keys(defaultApiDefinitions[apiDefinitionIndex].paths[path]).length === 0) {
          // eslint-disable-next-line
          delete defaultApiDefinitions[apiDefinitionIndex].paths[path];
        }
      }
    });

    return defaultApiDefinitions.map(ap => getStrictDefinition(ap));
  }

  private registerOperations(apiDefinitions: Document[]): Operations {
    const operations: Operations = new Proxy(
      {},
      {
        get(target: Dictionary<any>, prop: string) {
          if (!Object.prototype.hasOwnProperty.call(target, prop)) {
            throw new Error(
              `[ERROR] API version "${prop}" not found on your apiDefinitions.info.version`
            );
          }

          return target[prop];
        }
      }
    );
    apiDefinitions.forEach((apiDefinition, apiIndex) => {
      const apiVersion = apiDefinition.info.version;
      const components = getComponents(apiDefinition);
      let prevApiVersion: string;
      if (apiIndex > 0) {
        prevApiVersion = apiDefinitions[apiIndex - 1].info.version;
      }
      operations[apiVersion] = new Proxy(
        {},
        {
          get(target: Dictionary<any>, prop: string) {
            if (!Object.prototype.hasOwnProperty.call(target, prop)) {
              throw new Error(
                `[ERROR] API operationId "${prop}" not found on your apiDefinitions[${apiVersion}].paths[path][method].operationId`
              );
            }

            return target[prop];
          }
        }
      );

      const paths = Object.values(apiDefinition.paths);
      paths.forEach((pathSchema, pathIndex) => {
        const methods: OpenAPI.Operation[] = Object.values(pathSchema);
        methods.forEach((operationSchema: OpenAPI.Operation, methodIndex: number) => {
          if (!operationSchema.operationId) {
            throw new Error(
              `Operation id is a mandatory field on [${methods[methodIndex]}] ${paths[pathIndex]}`
            );
          }

          const operation = OperationBuilder.create(
            operationSchema.operationId,
            operationSchema,
            components,
            this
          );

          this.schemaCache.push({
            path: Object.keys(apiDefinition.paths)[pathIndex],
            method: Object.keys(pathSchema)[methodIndex],
            apiDefinitionIndex: apiIndex,
            operation
          });

          if (
            prevApiVersion &&
            operations[prevApiVersion][operation.id] &&
            !operations[prevApiVersion][operation.id].deprecated
          ) {
            operations[prevApiVersion][operation.id].nextVersionOperation = operation;
          }

          operations[apiVersion][operation.id] = operation;

          this.logger.info(`[OK] ${apiVersion}.${operation.id} operation registered on bautajs`);
          this.logger.events.emit(EventTypes.REGISTER_OPERATION, {
            apiVersion,
            operation
          });
        });
      });
    });
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
}

export default BautaJS;
