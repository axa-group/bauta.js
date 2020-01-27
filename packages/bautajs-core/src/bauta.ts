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
import fastGlob from 'fast-glob';
import { resolve } from 'path';
import { OperationBuilder } from './core/operation';
import { logger } from './logger';
import {
  Dictionary,
  BautaJSInstance,
  BautaJSOptions,
  Document,
  EventTypes,
  Logger,
  Operations
} from './utils/types';
import Parser from './open-api/parser';

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
    const parsedApiDefinitions = apiDefinitions.map(apiDefinition => {
      const parser = new Parser();
      parser.parse(apiDefinition);
      return parser;
    });

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
  }

  private registerOperations(apiDefinitions: Parser[]): Operations {
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
      const document = apiDefinition.document();
      if (document) {
        const apiVersion = document.generic.info.version;
        let prevApiVersion: string;
        const previousDocument =
          apiDefinitions[apiIndex - 1] && apiDefinitions[apiIndex - 1].document();
        if (apiIndex > 0 && previousDocument) {
          prevApiVersion = previousDocument.generic.info.version;
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

        document.routes.forEach(route => {
          const operation = OperationBuilder.create(route, apiVersion, this);

          operation.validateRequest(apiDefinition.validateRequest());
          operation.validateResponse(apiDefinition.validateResponse());

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
      }
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
