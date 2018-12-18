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
const glob = require('glob');
const path = require('path');
const mergeDeep = require('merge-deep');
const isPlainObject = require('lodash/isPlainObject');
const { deref } = require('./lib/schemas');
const store = require('./lib/store');
const validate = require('./lib/validators/validate');
const apiDefinitionSchema = require('./lib/validators/api-definition-schema.json');
const Service = require('./lib/core/Service');
const dataSourceSchema = require('./lib/validators/datasource-schema.json');

/**
 * A services dictionary containing all the built services
 * @constant {Object.<string, Service>}
 * @example
 * const { services } = require('bautajs');
 *
 * services.cats.v1.find.next(someAfterHook);
 *
 * const myContext = {};
 * const result = await services.cats.v1.find.exec(myContext);
 */
const services = {};

/**
 * Split the datasources in services and register them in to the services object
 * @ignore
 * @function registerServices
 * @param {Object[]} apiDefinitions - array of apis version
 * @param {Object} dataSources - a dictionary of services with his operations @see {@link ./validators/datasource-schema.json}
 */
function registerServices(apiDefinitions, dataSources) {
  const dataSourceServices = Object.keys(dataSources);
  dataSourceServices.forEach(serviceName => {
    const serviceTemplate = dataSources[serviceName];
    services[serviceName] = Object.freeze(
      new Service(serviceName, serviceTemplate, apiDefinitions)
    );
  });
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
function requireAll(folder, execute = true, vars = {}) {
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

/**
 * Build the BautaJS services with the given dataSources and loaders.
 * This services could be accessible from { services } = require('bautajs'); after the initialization.
 * @param {Object} config - Your current envionment or static configuration, this will be injected into dataSource render time.
 * @param {Object[]} apiDefinitions - An array of [OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md) definitions. See the valid schema @see {@link ./lib/validators/api-definition-schema-json}.
 * @param {string|string[]} [options.dataSourcesPath='./server/services/../.datasource.?(js|json)'] - A [node-glob](https://github.com/isaacs/node-glob) path to your dataSources.
 * @param {string|string[]} [options.loadersPath='./server/services/../.loader.js'] - A [node-glob](https://github.com/isaacs/node-glob) path to your loaders definitions.
 * @example
 * const bautajs = require('bautajs');
 * const config = {
 *   someProp: 'someVal'
 * };
 *
 * bautajs(config, {
 *  // Load all the files with datasource in the file name
 *  dataSourcesPath: './services/*-datasource.?(js|json)',
 *  loadersPath:  './services/*-loaders.js'
 * });
 *
 * // Assuming we have a dataSource for cats, once bautajs is initialized, you can execute the operation with the following code:
 * await bautajs.services.cats.v1.find.exec({});
 */
function batuajs(config, apiDefinitions, options = {}) {
  if (batuajs.initialized === true) {
    throw new Error('Wait a minute, you already initialized BautaJS (ノ・∀・)ノ');
  } else {
    batuajs.initialized = true;
  }

  if (!isPlainObject(config)) {
    throw new Error('Invalid or not found config. Config object must be a valid JSON object.');
  }

  let error = validate(apiDefinitions, apiDefinitionSchema);
  if (error) {
    throw new Error(`Invalid API definitions, "${error[0].dataPath}" ${error[0].message}`);
  }

  // Merge all the required dataSources
  const dataSources = mergeDeep(
    ...requireAll(
      options.dataSourcesPath || './server/services/**/*datasource.?(js|json)',
      true,
      services
    )
  );
  error = validate(dataSources, dataSourceSchema);
  if (error) {
    throw new Error(`Invalid or not found dataSources, "${error[0].dataPath}" ${error[0].message}`);
  }

  store.set('config', config);

  registerServices(apiDefinitions, dataSources);
  // Load custom loaders and operations modifiers
  requireAll(options.loadersPath || './server/services/**/*loader.js', true, services);
  // Load middlewares
  requireAll(options.middlewaresPath || './server/middlewares/**/*middleware.js', true, services);
}

module.exports = Object.assign(batuajs, {
  services,
  store,
  requireAll,
  deref
});
