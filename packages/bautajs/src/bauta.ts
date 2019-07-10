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
import ajv from 'ajv';
import deepmerge from 'deepmerge';
import glob from 'glob';
import OpenapiSchemaValidator, { OpenAPISchemaValidatorResult } from 'openapi-schema-validator';
import { IJsonSchema, OpenAPIV3 } from 'openapi-types';
import path from 'path';
import { ServiceBuilder } from './core/service';
import { logger } from './logger';
import { isMergeableObject } from './utils/is-mergeable-object';
import {
  BautaJSInstance,
  BautaJSOptions,
  DataSourceTemplate,
  Document,
  Logger,
  Services
} from './utils/types';
import { validate } from './validators/validate';

const datasourceSchemaJson = require('./validators/datasource-schema.json');
const extendOpenapiSchemaJson = require('./validators/extend-openapi-schema.json');

function setDefinitionDefaults(apiDefinition: Document): Document {
  return {
    ...apiDefinition,
    validateRequest: apiDefinition.validateRequest !== false,
    validateResponse: apiDefinition.validateResponse !== false
  };
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
 *  // Load all the files with datasource in the file name
 *  dataSourcesPath: './services/*-datasource.?(js|json)',
 *  resolversPath:  './services/*-resolver.js',
 *  dataSourceStatic: static,
 *  servicesWrapper: (services) => {
 *    return {
 *      wrappedService: (_, ctx) => {
 *        return services.service.v1.operation.run(ctx);
 *      }
 *    }
 *  }
 * });
 *
 * // Assuming we have a dataSource for cats, once bautajs is initialized, you can execute the operation with the following code:
 * await bautaJS.services.cats.v1.find.run({});
 */
export class BautaJS implements BautaJSInstance {
  /**
   * @type {Services}
   * @memberof BautaJS
   */
  public readonly services: Services = {};

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
    const defaultApiDefinitions = apiDefinitions.map((apiDefinition: Document) => {
      // eslint-disable-next-line no-param-reassign
      apiDefinition = setDefinitionDefaults(apiDefinition);
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

      return apiDefinition;
    });

    const dataSourcesTemplates: DataSourceTemplate<any>[] = BautaJS.requireAll(
      options.dataSourcesPath || './server/services/**/*datasource.js',
      true
    ) as DataSourceTemplate<any>[];

    const dataSource: DataSourceTemplate<any> = deepmerge.all(dataSourcesTemplates, {
      isMergeableObject
    }) as DataSourceTemplate<any>;

    const error: ajv.ErrorObject[] | null | undefined = validate(dataSource, datasourceSchemaJson);
    if (error) {
      throw new Error(
        `Invalid or not found dataSources, "${error[0].dataPath}" ${error[0].message}`
      );
    }

    /**
     * @memberof BautaJS#
     * @property {Object.<string, Service>} services - A services dictionary containing all the created services
     */
    this.services = this.registerServices(
      defaultApiDefinitions,
      dataSource,
      options.dataSourceStatic
    );
    /**
     * @memberof BautaJS#
     * @property {Logger} logger - A [debug]{@link https://www.npmjs.com/package/debug} logger instance
     */
    this.logger = logger;

    // Register the global utils
    const utils: any =
      typeof options.servicesWrapper === 'function' ? options.servicesWrapper(this.services) : null;

    // Load custom resolvers and operations modifiers
    BautaJS.requireAll<[Services, any]>(
      options.resolversPath || './server/services/**/*resolver.js',
      true,
      [this.services, utils]
    );

    // Once all api definitions are filtered from the operations merge it all again
    this.apiDefinitions = this.mergeApiDefinitions();
  }

  private mergeApiDefinitions() {
    return Object.values(this.services).map(version => {
      const definitionsPices: Document[] = [];
      Object.values(version).forEach(operations => {
        Object.values(operations).forEach(operation => {
          definitionsPices.push(operation.schema);
        });
      });

      return deepmerge.all(definitionsPices) as Document;
    });
  }

  private registerServices(
    apiDefinitions: Document[],
    dataSources: DataSourceTemplate<any>,
    dataSourceStatic: any
  ): Services {
    const services: Services = {};
    const dataSourceServices = Object.keys(dataSources.services);
    dataSourceServices.forEach(serviceId => {
      const serviceTemplate = dataSources.services[serviceId];
      services[serviceId] = ServiceBuilder.create(
        serviceId,
        serviceTemplate,
        apiDefinitions,
        dataSourceStatic,
        this
      );
    });

    return services;
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
      glob.sync(folderPath, { strict: true }).forEach((file: string) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        let data = require(path.resolve(file));
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
