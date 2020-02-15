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
const STJS = require('stjs');
const glob = require('glob');
const path = require('path');
const merge = require('deepmerge');
const OpenAPISchemaValidator = require('openapi-schema-validator').default;
const validate = require('./validators/validate');
const Service = require('./core/Service');
const dataSourceSchema = require('./validators/datasource-schema.json');
const extendOpenAPISchema = require('./validators/extend-openapi-schema.json');
const logger = require('./logger');
const combineMerge = require('./utils/combine-merge');

/**
 * Split the datasources in services and register them in to the services object
 * @ignore
 * @function registerServices
 * @param {Object[]} apiDefinitions - array of apis version
 * @param {Object} dataSources - a dictionary of services with his operations @see {@link ./validators/datasource-schema.json}
 * @returns {Object} services - the list of services
 */
function registerServices(apiDefinitions, dataSources) {
  const services = {};
  const dataSourceServices = Object.keys(dataSources.services);
  dataSourceServices.forEach(serviceId => {
    const serviceTemplate = dataSources.services[serviceId];
    services[serviceId] = Object.freeze(new Service(serviceId, serviceTemplate, apiDefinitions));
  });

  return services;
}

function setDefinitionDefaults(apiDefinition) {
  return {
    ...apiDefinition,
    validateRequest: apiDefinition.validateRequest !== false,
    validateResponse: apiDefinition.validateResponse !== false
  };
}

/**
 * Build the BautaJS services with the given dataSources and resolvers.
 * This services could be accessible from the instance .services after the initialization.
 * @public
 * @class BautaJS
 * @param {Object[]|Object} apiDefinitions - An array of [OpenAPI 3.0/2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md) definitions. See the valid schema @see {@link ./lib/validators/api-definition-schema-json}.
 * @param {Object} [options]
 * @param {string|string[]} [options.dataSourcesPath='./server/services/../..-datasource.?(js|json)'] - A [node-glob](https://github.com/isaacs/node-glob) path to your dataSources.
 * @param {string|string[]} [options.resolversPath='./server/services/../..-resolver.js'] - A [node-glob](https://github.com/isaacs/node-glob) path to your resolvers definitions.
 * @param {Object} [options.dataSourceCtx={}] - Object to be injected on the dataSources in run time
 * @param {function} [options.servicesWrapper] - function that have services as entry point and could be used to wrap services with global behaviours
 * @example
 * const Bautajs = require('bautajs');
 * const apiDefinitions = require('./open-api-definition.json');
 * const ctx = {
 *   someProp: 'someVal'
 * };
 *
 * const bautaJS = new Bautajs(apiDefinitions, {
 *  // Load all the files with datasource in the file name
 *  dataSourcesPath: './services/*-datasource.?(js|json)',
 *  resolversPath:  './services/*-resolver.js',
 *  dataSourceCtx: ctx,
 *  servicesWrapper: (services) => {
 *    return {
 *      wrappedService: (_, ctx) => {
 *        return services.service.v1.operation.exec(ctx.req, ctx.res);
 *      }
 *    }
 *  }
 * });
 *
 * // Assuming we have a dataSource for cats, once bautajs is initialized, you can execute the operation with the following code:
 * await bautaJS.services.cats.v1.find.exec({});
 */
module.exports = class Bautajs {
  constructor(apiDefinitions, options = {}) {
    let error;
    if (!Array.isArray(apiDefinitions)) {
      // eslint-disable-next-line no-param-reassign
      apiDefinitions = [setDefinitionDefaults(apiDefinitions)];
    } else {
      // eslint-disable-next-line no-param-reassign
      apiDefinitions = apiDefinitions.map(setDefinitionDefaults);
    }

    apiDefinitions.some(apiDefinition => {
      const apiDefinitionValidator = new OpenAPISchemaValidator({
        extensions: extendOpenAPISchema,
        version: apiDefinition.openapi ? 3 : 2
      });
      error = apiDefinitionValidator.validate(apiDefinition);

      return error || false;
    });
    if (error.errors.length > 0) {
      throw new Error(
        `Invalid API definitions, "${error.errors[0].dataPath}" ${error.errors[0].message}`
      );
    }

    const dataSourcesTemplates = Bautajs.requireAll(
      options.dataSourcesPath || './server/services/**/*datasource.?(js|json)',
      true
    );

    // Maintain the not resolved templates that have existence operator (#?)
    const dataSources = merge.all(
      [
        ...dataSourcesTemplates,
        ...STJS.select(options.dataSourceCtx)
          .transformWith(dataSourcesTemplates)
          .root()
      ],
      { arrayMerge: combineMerge }
    );

    error = validate(dataSources, dataSourceSchema);
    if (error) {
      throw new Error(
        `Invalid or not found dataSources, "${error[0].dataPath}" ${error[0].message}`
      );
    }
    /**
     * @memberof BautaJS#
     * @property {Object.<string, Service>} services - A services dictionary containing all the created services
     */
    this.services = registerServices(apiDefinitions, dataSources);
    /**
     * @memberof BautaJS#
     * @property {Logger} logger - A [debug]{@link https://www.npmjs.com/package/debug} logger instance
     */
    this.logger = logger;

    // Register the global utils
    const utils =
      typeof options.servicesWrapper === 'function' ? options.servicesWrapper(this.services) : null;

    // Load custom resolvers and operations modifiers
    Bautajs.requireAll(options.resolversPath || './server/services/**/*resolver.js', true, [
      this.services,
      utils
    ]);

    return this;
  }

  /**
   * Require a bunch of files that matches the given [glob](https://github.com/isaacs/node-glob) path.
   * @public
   * @memberof BautaJS#
   * @static
   * @param {string|string[]} folder - the given folder magic path, see https://github.com/isaacs/node-glob
   * @param {boolean} [execute=true] - execute the required files with the given vars if they are functions
   * @param {Object[]|Object} [vars] - optional variables to add as a parameter on the file execution
   * @returns {any[]} array of required files
   * @example
   * const { requireAll } = require('bautajs');
   *
   * const files = requireAll('./my/path/to/datasources/*.js', true, {someVar:123});
   */
  static requireAll(folder, execute = true, vars = {}) {
    const execFiles = folderPath => {
      const result = [];
      glob.sync(folderPath, { strict: true }).forEach(file => {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        let data = require(path.resolve(file));
        if (typeof data === 'function' && execute === true) {
          data = Array.isArray(vars) ? data(...vars) : data(vars);
        }

        result.push(data);
      });

      return result;
    };

    let files = [];
    if (Array.isArray(folder)) {
      files = folder.map(folderPath => execFiles(folderPath, execute, vars));
    } else {
      files = execFiles(folder, execute, vars);
    }

    return files;
  }
};
