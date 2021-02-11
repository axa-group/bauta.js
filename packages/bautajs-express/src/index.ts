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
import compression from 'compression';
import express, { Application, Request, Response } from 'express';
import http from 'http';
import https from 'https';
import routeOrder from 'route-order';
import { BautaJS, BautaJSOptions, Document, Operation, Logger } from '@bautajs/core';
import { MiddlewareOptions, ICallback } from './types';
import {
  initReqIdGenerator,
  initMorgan,
  initBodyParser,
  initHelmet,
  initCors,
  initExplorer
} from './middlewares';
import { getContentType, getServerAddress } from './utils';

export * from './types';

/**
 * Create an Express server using the BautaJS library with almost 0 configuration
 * @export
 * @class BautaJSExpress
 * @param {Document[]} apiDefinitions
 * @param {BautaJSOptions} options
 * @extends {BautaJS}
 * @example
 * const { BautaJSExpress } = require('@bauta/express');
 * const apiDefinition from'../../api-definition.json');
 *
 * const bautJSExpress = new BautaJSExpress(apiDefinition, {});
 * bautJSExpress.applyMiddlewares();
 * bautaJS.listen();
 */
export class BautaJSExpress extends BautaJS {
  /**
   * @type {Application}
   * @memberof BautaJSExpress
   */
  public app: Application;

  constructor(apiDefinitions: Document[], options: BautaJSOptions) {
    super(apiDefinitions, options);
    this.app = express();
  }

  private addRoute(operation: Operation) {
    const method = operation.route?.method.toLowerCase() as keyof express.Application;
    const responses = operation.route?.schema.response;
    const { url = '', basePath = '' } = operation.route || {};
    const route = (basePath + url).replace(/\/\//, '/');

    this.app[method](
      route,
      (req: Request & { id: string; log: Logger }, res: Response, next: ICallback) => {
        const startTime = new Date();
        const resolverWrapper = (response: any) => {
          if (res.headersSent || res.finished) {
            return null;
          }

          if (!res.statusCode) {
            res.status(200);
          }

          if (responses && responses[res.statusCode]) {
            const contentType = operation.route && getContentType(operation.route, res.statusCode);
            res.set({
              ...(contentType ? { 'Content-type': contentType } : {}),
              ...responses[res.statusCode].headers,
              ...res.getHeaders()
            });
          }

          if (res.statusCode === 204) {
            res.send();
          } else {
            res.json(response || {});
          }
          const finalTime = new Date().getTime() - startTime.getTime();

          req.log.info(
            `The operation execution of ${url} took: ${
              typeof finalTime === 'number' ? finalTime.toFixed(2) : 'unknown'
            } ms`
          );
          return res.end();
        };
        const rejectWrapper = (response: any) => {
          // In case the request was canceled by the user there is no need to send any message to the user.
          if (response.name === 'CancelError') {
            req.log.error(`The request to ${req.url} was canceled by the requester`);
            return null;
          }

          if (res.headersSent || res.finished) {
            req.log.error(
              {
                error: {
                  name: response.name,
                  code: response.code,
                  message: response.message
                }
              },
              `Response has been sent to the requester, but the promise threw an error`
            );
            return null;
          }

          res.status(response.statusCode || 500);
          const finalTime = new Date().getTime() - startTime.getTime();
          req.log.info(
            `The operation execution of ${url} took: ${
              typeof finalTime === 'number' ? finalTime.toFixed(2) : 'unknown'
            } ms`
          );

          return next(response);
        };

        const op = operation.run({ req, res });
        req.on('abort', () => {
          op.cancel('Request was aborted by the requester intentionally');
        });
        req.on('aborted', () => {
          op.cancel('Request was aborted by the requester intentionally');
        });
        req.on('timeout', () => {
          op.cancel('Request was aborted by the requester because of a timeout');
        });

        op.then(resolverWrapper).catch(rejectWrapper);
      }
    );

    this.logger.info(
      `[OK] [${method.toUpperCase()}] ${route} operation exposed on the API from ${
        operation.version
      }.${operation.id}`
    );
  }

  private processOperations() {
    return Object.values(this.operations).reduce((routes: any, versions) => {
      Object.values(versions).forEach(operation => {
        if (!operation.isPrivate() && operation.route) {
          if (!routes[operation.route.url]) {
            // eslint-disable-next-line no-param-reassign
            routes[operation.route.url] = {};
          }
          // eslint-disable-next-line no-param-reassign
          routes[operation.route.url][operation.route.method] = operation;
        }
      });

      return routes;
    }, {});
  }

  /**
   *
   * Add the standard express middlewares, bootstrap the bautajs instance and expose the operations routes using the given OpenAPI definition.
   * @async
   * @param {MiddlewareOptions} [options={
   *       cors: {
   *         enabled: true
   *       },
   *       bodyParser: {
   *         enabled: true
   *       },
   *       helmet: {
   *         enabled: true
   *       },
   *       morgan: {
   *         enabled: true
   *       },
   *       explorer: {
   *         enabled: true
   *       }
   *     }]
   * @returns
   * @memberof BautaJSExpress
   */
  public async applyMiddlewares(
    options: MiddlewareOptions = {
      cors: {
        enabled: true
      },
      bodyParser: {
        enabled: true
      },
      helmet: {
        enabled: true
      },
      morgan: {
        enabled: true
      },
      explorer: {
        enabled: true
      },
      reqIdGenerator: {
        enabled: true
      }
    }
  ) {
    initReqIdGenerator(this.app, this.logger, options.reqIdGenerator);
    initMorgan(this.app, options.morgan);
    initHelmet(this.app, options.helmet);
    initCors(this.app, options.cors);
    this.app.use(compression());
    initBodyParser(this.app, options.bodyParser);

    await this.bootstrap();

    const routes = this.processOperations();

    Object.keys(routes)
      .sort(routeOrder())
      .forEach(route => {
        const methods = Object.keys(routes[route]);
        methods.forEach(method => this.addRoute(routes[route][method]));
      });

    initExplorer(this.app, this.apiDefinitions, this.operations, options.explorer);

    return this;
  }

  /**
   * Start the express server as http/https listener. In case you need to pass custom parameters to listen as backlog or a custom listen callback,
   * create a custom listen function and use bautajs.app.
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
  listen(
    port = 3000,
    hostname = undefined,
    httpsEnabled = false,
    httpsOptions = {}
  ): https.Server | http.Server {
    let server: https.Server | http.Server;

    if (httpsEnabled) {
      server = https.createServer(httpsOptions, this.app);
    } else {
      server = http.createServer(this.app);
    }
    server.listen(port, hostname, () => {
      const address = getServerAddress(server, httpsEnabled);
      if (process.env.DEBUG) {
        this.logger.info(`Server listening at ${address}`);
      } else {
        // eslint-disable-next-line no-console
        console.info(`Server listening at ${address}`);
      }
    });

    return server;
  }
}

export default BautaJSExpress;
