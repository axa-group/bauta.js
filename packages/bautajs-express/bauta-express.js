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
const swaggerUi = require('swagger-ui-express');
const BautaJS = require('bautajs');
const helmetMw = require('helmet');
const corsMw = require('cors');
const compression = require('compression');
const express = require('express');
const https = require('https');
const http = require('http');
const morganMw = require('morgan');
const chalk = require('chalk');
const specificity = require('route-order')();
const strictDefinition = require('bautajs/utils/strict-definitions');

const logFormat =
  ':method :url. Main headers: Time-Zone::req[Time-Zone], Accept-Language::req[Accept-Language],  device::req[device],  mana-version::req[mana-version], platform-version::req[platform-version]';

function toExpressParams(part) {
  return part.replace(/\{([^}]+)}/g, ':$1');
}

function getSchemaData(schema) {
  const swaggerPath = Object.keys(schema)[0];
  const expressRoute = swaggerPath
    .substring(1)
    .split('/')
    .map(toExpressParams)
    .join('/');

  const method = Object.keys(schema[swaggerPath])[0];
  const { responses, produces } = schema[swaggerPath][method];
  return { expressRoute, method, responses, produces, swaggerPath };
}

/**
 * Create an Express server using the BautaJS library with almost 0 configuration
 * @public
 * @class BautaJSExpress
 * @extends BautaJS
 * @param {Object[]|Object} apiDefinitions - An array of [OpenAPI 3.0/2.0](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md) definitions. See the valid schema @see {@link ./lib/validators/api-definition-schema-json}.
 * @param {Object} [options]
 * @param {string|string[]} [options.dataSourcesPath='./server/services/../.datasource.?(js|json)'] - A [node-glob](https://github.com/isaacs/node-glob) path to your dataSources.
 * @param {string|string[]} [options.loadersPath='./server/services/../.loader.js'] - A [node-glob](https://github.com/isaacs/node-glob) path to your loaders definitions.
 * @param {any} [options.dataSourceCtx={}] - Object to be injected on the dataSources in run time
 * @param {function} [options.servicesWrapper] - function that have services as entry point and could be used to wrap services with global behaviours
 * @example
 * const BautaJSExpress = require('bauta-express');
 * const apiDefinition = require('../../api-definition.json');
 *
 * const bautJSExpress = new BautaJSExpress(apiDefinition, {});
 * bautJSExpress.applyMiddlewares();
 * bautaJS.listen();
 */
class BautaJSExpress extends BautaJS {
  constructor(apiDefinitions, options) {
    super(apiDefinitions, options);
    this.routes = [];
    this.apiDefinitions = apiDefinitions.map(ad => ({ ...ad, paths: {} }));
    this.app = express();
  }

  addRoute(expressRoute) {
    Object.keys(this.routes[expressRoute]).forEach(method => {
      const { operation, responses, produces } = this.routes[expressRoute][method];
      const basePath =
        operation.apiDefinition.servers && operation.apiDefinition.servers[0].url
          ? operation.apiDefinition.servers[0].url
          : operation.apiDefinition.basePath;
      this.app[method](basePath + expressRoute, (req, res, next) => {
        const startTime = new Date();
        const resolverWraper = response => {
          if (res.headersSent || res.finished) {
            return null;
          }

          if (!res.statusCode) {
            res.status(200);
          }

          if (responses[res.statusCode]) {
            const contentType = operation.apiDefinition.openapi
              ? Object.keys(responses[res.statusCode].content)[0]
              : produces[0];
            res.set({
              'Content-type': contentType,
              ...responses[res.statusCode].headers
            });
          }

          res.json(response || {});
          const finalTime = new Date().getTime() - startTime.getTime();

          this.logger.info(
            `The operation execution of ${basePath} + ${expressRoute} took: ${
              typeof finalTime === 'number' ? finalTime.toFixed(2) : 'unkown'
            } ms`
          );
          return res.end();
        };
        const rejectWraper = response => {
          res.status(response.statusCode || 500);
          const finalTime = new Date().getTime() - startTime.getTime();
          this.logger.info(
            `The operation execution of ${basePath} + ${expressRoute} took: ${
              typeof finalTime === 'number' ? finalTime.toFixed(2) : 'unkown'
            } ms`
          );

          return next(response);
        };

        operation
          .exec(req, res)
          .then(resolverWraper)
          .catch(rejectWraper);
      });

      this.logger.info(
        '[OK]',
        chalk.yellowBright(
          `[${method.toUpperCase()}] ${basePath + expressRoute} operation exposed on the API from ${
            operation.serviceId
          }.${operation.apiDefinition.info.version}.${operation.operationId}`
        )
      );
      this.logger.events.emit(this.logger.eventTypes.EXPOSE_OPERATION, {
        route: basePath + expressRoute,
        operation
      });
    });
  }

  updateRoutes() {
    Object.keys(this.services).forEach(serviceId => {
      const service = this.services[serviceId];
      Object.keys(service).forEach(versionId => {
        const version = service[versionId];
        const apiVersion = this.apiDefinitions.find(ad => ad.info.version === versionId);
        version.operationIds.forEach(operationId => {
          const operation = version[operationId];
          if (operation.schema && !operation.private) {
            const { method, expressRoute, responses, produces, swaggerPath } = getSchemaData(
              operation.schema
            );
            if (!this.routes[expressRoute]) {
              this.routes[expressRoute] = {};
            }

            this.routes[expressRoute][method] = { operation, responses, produces };

            apiVersion.paths[swaggerPath] = {
              ...apiVersion.paths[swaggerPath],
              ...operation.schema[swaggerPath]
            };
          } else {
            this.logger.warn(
              `[NOT] ${operation.serviceId}.${operation.operationId} operation definition not found`
            );
          }
        });
      });
    });

    this.apiDefinitions = this.apiDefinitions.map(apiDefinition => strictDefinition(apiDefinition));
  }

  /**
   * Add the standard express middlewares and create the created services routes using the given OpenAPI definition.
   * @param {Object} [options={}] - Optional triggers for express middlewares
   * @param {Object|boolean} [options.cors=true] - Set as false to not add it. Set as an object to pass options to the cors middleware.
   * @param {Object|boolean} [options.explorer=true] - Set as false to not add it. Set as an object to pass options to the explorer middleware.
   * @param {Object|boolean} [options.bodyParser=true] - Set as false to not add it. Set as an object to pass options to the body parse middleware.
   * @param {Object|boolean} [options.helmet=true] - Set as false to not add it. Set as an object to pass options to the helmet middleware.
   * @param {Object|boolean} [options.morgan=true] - Set as false to not add it. Set as an object to pass options to the morgan middleware.
   * @returns {BautaJSExpress}
   * @memberof BautaJSExpress#
   */
  applyMiddlewares({
    cors = true,
    bodyParser = true,
    helmet = true,
    morgan = true,
    explorer = true
  } = {}) {
    if (morgan === true) {
      this.app.use(
        morganMw(logFormat, {
          immediate: true
        })
      );
      this.app.use(
        morganMw('tiny', {
          immediate: false
        })
      );
    } else if (morgan) {
      this.app.use(
        morganMw(morgan, {
          immediate: true
        })
      );
      this.app.use(
        morganMw('tiny', {
          immediate: false
        })
      );
    }

    if (helmet === true) {
      this.app.use(helmetMw());
    } else if (helmet) {
      this.app.use(helmetMw(helmet));
    }

    if (cors === true) {
      this.app.use(corsMw());
    } else if (cors) {
      this.app.use(corsMw(cors));
    }
    this.app.use(compression());

    if (bodyParser === true) {
      this.app.use(express.json({ limit: '50mb' }));
      this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    } else if (bodyParser) {
      this.app.use(express.json(bodyParser.json));
      this.app.use(express.urlencoded(bodyParser.urlencoded));
    }

    this.updateRoutes();

    Object.keys(this.routes)
      .sort(specificity)
      .forEach(this.addRoute.bind(this));

    if (explorer) {
      this.apiDefinitions.forEach(apiDefinition => {
        const openAPIPath = `/${apiDefinition.info.version}/openapi.json`;
        this.app.get(openAPIPath, (req, res) => {
          res.json(apiDefinition);
          res.end();
        });
        this.app.use(
          `/${apiDefinition.info.version}/${explorer.path || 'explorer'}`,
          swaggerUi.serve,
          swaggerUi.setup(null, {
            ...explorer,
            swaggerOptions: {
              ...(explorer.swaggerOptions ? explorer.swaggerOptions : {}),
              url: openAPIPath
            }
          })
        );
      });
    }

    return this;
  }

  /**
   * Start the express server as http/https listener
   * @param {number} [port=3000] - The port to listener
   * @param {string} [host='localhost'] - The api host
   * @param {boolean} [httpsEnabled=false] - True to start the server as https server
   * @param {Object} [httpsOptions] - True to start the server as https server
   * @param {string} [httpsOptions.cert] - The server cert
   * @param {string} [httpsOptions.key] - The server key
   * @param {string} [httpsOptions.passphrase] - The key's passphrase
   * @returns {http|https} - nodejs http/https server
   * @memberof BautaJSExpress#
   */
  listen(port = 3000, host = 'localhost', httpsEnabled = false, httpsOptions = {}) {
    let server;
    let protocol = 'http://';

    if (httpsEnabled) {
      protocol = 'https://';
      server = https.createServer(httpsOptions, this.app);
    } else {
      server = http.createServer(this.app);
    }

    server.listen(port, err => {
      if (err) {
        throw err;
      }
      const baseUrl = `${protocol + host}:${port}`;
      if (process.env.DEBUG) {
        this.logger.info(`Server listening on ${baseUrl}`);
      } else {
        // eslint-disable-next-line no-console
        console.info(`Server listening on ${baseUrl}`);
      }
    });

    return server;
  }
}

module.exports = BautaJSExpress;
