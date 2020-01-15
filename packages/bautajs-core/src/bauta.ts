/*
 * Copyright (c) AXA Group Operations Spain S.A.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
 *  dataSourceStatic: static,
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
