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
import { OperationBuilder } from './core/operation';
import { DefaultLogger } from './default-logger';
import {
  Dictionary,
  BautaJSInstance,
  BautaJSOptions,
  Document,
  Logger,
  Operations,
  BasicOperation
} from './utils/types';
import { isLoggerValid } from './utils/logger-validator';
import Parser from './open-api/parser';

interface API {
  version: string;
  operations: BasicOperation[];
}

function prebuildApi(apiDefinitions: Document[]): API[] {
  return apiDefinitions.map((apiDefinition: Document) => {
    try {
      return {
        version: apiDefinition.info.version,
        operations: Object.keys(apiDefinition.paths)
          .map(path =>
            Object.keys(apiDefinition.paths[path]).map(method => ({
              id: apiDefinition.paths[path][method].operationId,
              version: apiDefinition.info.version,
              deprecated: apiDefinition.paths[path][method].deprecated
            }))
          )
          .flat(1)
      };
    } catch (e) {
      throw new Error(`The Openapi API definition provided is not valid. Error ${e.message}`);
    }
  });
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
 *  staticConfig: static,
 * });
 *
 * // Assuming we have an api definition with version equals to 'v1' and have an operationId called 'find' we can run the following code:
 * await bautaJS.operations.v1.find.run({});
 */
export class BautaJS implements BautaJSInstance {
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

  constructor(public readonly apiDefinitions: Document[], options: BautaJSOptions = {}) {
    const apis: API[] = prebuildApi(apiDefinitions);
    let responseValidation = false;
    let requestValidation = true;

    this.staticConfig = options.staticConfig;

    this.logger = options.logger || new DefaultLogger();
    if (!isLoggerValid(this.logger)) {
      throw new Error(
        'Logger is not valid. Must be compliant with basic logging levels(trace, debug, info, warn, error, fatal)'
      );
    }

    if (typeof options.enableRequestValidation === 'boolean') {
      requestValidation = options.enableRequestValidation;
    }

    if (typeof options.enableResponseValidation === 'boolean') {
      responseValidation = options.enableResponseValidation;
    }

    this.operations = this.registerOperations(apis, requestValidation, responseValidation);

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
  }

  public async bootstrap(): Promise<void> {
    const asyncTasks = this.apiDefinitions.map(async apiDefinition => {
      const parser = new Parser(this.logger);
      const parsedApiDefinition = await parser.asyncParse(apiDefinition);
      const { version } = parsedApiDefinition.generic.info;
      parsedApiDefinition.routes.forEach(route => {
        this.operations[version][route.operationId].addRoute(route);
      });
    });

    await Promise.all(asyncTasks);
  }

  private registerOperations(
    apis: API[],
    enableRequestValidation: boolean,
    enableResponseValidation: boolean
  ): Operations {
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

    apis.forEach((api, apiIndex) => {
      const apiVersion = api.version;
      let prevApiVersion: string;
      const prevApi = apis[apiIndex - 1];
      if (apiIndex > 0 && prevApi) {
        prevApiVersion = prevApi.version;
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

      api.operations.forEach(op => {
        const operation = OperationBuilder.create(op.id, apiVersion, this);
        operation.validateResponse(enableResponseValidation);
        operation.validateRequest(enableRequestValidation);

        if (op.deprecated === true) {
          operation.setAsDeprecated();
        }
        if (
          prevApiVersion &&
          operations[prevApiVersion][operation.id] &&
          !operations[prevApiVersion][operation.id].deprecated
        ) {
          operations[prevApiVersion][operation.id].nextVersionOperation = operation;
        }

        operations[apiVersion][operation.id] = operation;

        this.logger.info(`[OK] ${apiVersion}.${operation.id} operation registered on bautajs`);
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
