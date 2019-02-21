/*
 * Copyright (c) 2018 AXA Shared Services Spain S.A.
 *
 * Licensed under the MyAXA inner-source License (the "License");
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
const mergeDeep = require('merge-deep');
const OpenAPISchemaValidator = require('openapi-schema-validator').default;
const validate = require('./lib/validators/validate');
const Service = require('./lib/core/Service');
const dataSourceSchema = require('./lib/validators/datasource-schema.json');
const inheritanceSchema = require('./lib/validators/inheritance-schema.json');

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
  const dataSourceServices = Object.keys(dataSources);
  dataSourceServices.forEach(serviceId => {
    const serviceTemplate = dataSources[serviceId];
    services[serviceId] = Object.freeze(new Service(serviceId, serviceTemplate, apiDefinitions));
  });

  return services;
}

/**
 * Build the BautaJS services with the given dataSources and loaders.
 * This services could be accessible from the instance .services after the initialization.
 * @param {Object[]|Object} apiDefinitions - An array of [OpenAPI 3.0/2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md) definitions. See the valid schema @see {@link ./lib/validators/api-definition-schema-json}.
 * @param {string|string[]} [options.dataSourcesPath='./server/services/../.datasource.?(js|json)'] - A [node-glob](https://github.com/isaacs/node-glob) path to your dataSources.
 * @param {string|string[]} [options.loadersPath='./server/services/../.loader.js'] - A [node-glob](https://github.com/isaacs/node-glob) path to your loaders definitions.
 * @param {any} [options.dataSourceCtx={}] - Object to be injected on the dataSources in run time
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
 *  loadersPath:  './services/*-loaders.js',
 *  dataSourceCtx: ctx
 * });
 *
 * // Assuming we have a dataSource for cats, once bautajs is initialized, you can execute the operation with the following code:
 * await bautaJS.services.cats.v1.find.exec({});
 */
module.exports = class Batuajs {
  constructor(apiDefinitions, options = {}) {
    let error;
    if (!Array.isArray(apiDefinitions)) {
      // eslint-disable-next-line no-param-reassign
      apiDefinitions = [apiDefinitions];
    }

    apiDefinitions.some(apiDefinition => {
      const apiDefinitionValidator = new OpenAPISchemaValidator({
        version2Extensions: inheritanceSchema,
        version3Extensions: inheritanceSchema,
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

    // Merge all the required dataSources-
    const dataSources = STJS.select(options.dataSourceCtx)
      .transformWith(
        mergeDeep(
          ...Batuajs.requireAll(
            options.dataSourcesPath || './server/services/**/*datasource.?(js|json)',
            true
          )
        )
      )
      .root();
    error = validate(dataSources, dataSourceSchema);
    if (error) {
      throw new Error(
        `Invalid or not found dataSources, "${error[0].dataPath}" ${error[0].message}`
      );
    }

    this.services = registerServices(apiDefinitions, dataSources);
    // Load custom loaders and operations modifiers
    Batuajs.requireAll(
      options.loadersPath || './server/services/**/*loader.js',
      true,
      this.services
    );
    // Load middlewares
    Batuajs.requireAll(
      options.middlewaresPath || './server/middlewares/**/*middleware.js',
      true,
      this.services
    );

    return this;
  }

  /**
   * Require a bunch of files that matches the given [glob](https://github.com/isaacs/node-glob) path.
   * @public
   * @function requireAll
   * @param {string|string[]} folder - the given folder magic path, see https://github.com/isaacs/node-glob
   * @param {boolean} [execute=true] - execute the required files with the given vars if they are functions
   * @param {Object} [vars] - optional variables to add as a parameter on the file execution
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
          data = data(vars);
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
