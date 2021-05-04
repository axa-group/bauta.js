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
import express, { Response, IRoute } from 'express';
import routeOrder from 'route-order';
import * as bautajs from '@bautajs/core';
import { MiddlewareOptions, ExpressRequest } from './types';
import {
  initReqIdGenerator,
  initMorgan,
  initBodyParser,
  initHelmet,
  initCors,
  initExplorer
} from './middlewares';
import { getContentType, hrTimeToMilliseconds } from './utils';

/**
 * Create an Express server using the BautaJS library with almost 0 configuration
 * @export
 * @class BautaJSExpress
 * @param {Document[]} apiDefinitions
 * @param {BautaJSOptions} options
 * @extends {BautaJS}
 * @example
 * const express = require('express');
 * const { BautaJSExpress } = require('@bauta/express');
 * const apiDefinition = require('../../api-definition.json');
 *
 * const app = express();
 * const bautaJSExpress = new BautaJSExpress(apiDefinition, {});
 * const router = await bautaJSExpress.buildRouter();
 *
 * app.router(router);
 *
 * app.listen(3000, err => {
 *   if (err) throw err;
 *   console.info('Server listening on localhost: 3000');
 * });
 */
export class BautaJSExpress extends bautajs.BautaJS<{ req: ExpressRequest; res: Response }> {
  constructor(
    apiDefinitions: bautajs.Document[],
    options: Omit<bautajs.BautaJSOptions, 'getRequest' | 'getResponse'>
  ) {
    super(apiDefinitions, {
      ...options,
      getRequest(raw) {
        return raw.req;
      },
      getResponse(raw) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
    });
  }

  private addRoute(operation: bautajs.Operation, router: express.Router) {
    const method = operation.route?.method.toLowerCase() as keyof Omit<IRoute, 'path' | 'stack'>;
    const responses = operation.route?.schema.response;
    const { url = '', basePath = '' } = operation.route || {};
    const route = (basePath + url).replace(/\/\//, '/');

    router[method](route, (req, res, next) => {
      const startTime = process.hrtime();
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
        const finalTime = process.hrtime(startTime);

        (req as ExpressRequest).log.info(
          `The operation execution of ${url} took: ${hrTimeToMilliseconds(finalTime)} ms`
        );
        return res.end();
      };
      const rejectWrapper = (response: any) => {
        // In case the request was canceled by the user there is no need to send any message to the user.
        if (response.name === 'CancelError') {
          (req as ExpressRequest).log.error(
            `The request to ${req.url} was canceled by the requester`
          );
          return null;
        }

        if (res.headersSent || res.finished) {
          (req as ExpressRequest).log.error(
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
        const finalTime = process.hrtime(startTime);
        (req as ExpressRequest).log.info(
          `The operation execution of ${url} took: ${hrTimeToMilliseconds(finalTime)} ms`
        );

        return next(response);
      };
      try {
        const op = operation.run<{ req: ExpressRequest; res: Response }, any>({
          req: req as ExpressRequest,
          res,
          id: (req as ExpressRequest).id || req.header('x-request-id'),
          url: (req as ExpressRequest).url,
          log: (req as ExpressRequest).log
        });
        if (bautajs.isPromise(op)) {
          req.on('abort', () => {
            (op as any).cancel('Request was aborted by the requester intentionally');
          });
          req.on('aborted', () => {
            (op as any).cancel('Request was aborted by the requester intentionally');
          });
          req.on('timeout', () => {
            (op as any).cancel('Request was aborted by the requester because of a timeout');
          });
          op.then(resolverWrapper).catch(rejectWrapper);
        } else {
          resolverWrapper(op);
        }
      } catch (e) {
        rejectWrapper(e);
      }
    });

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
   * Create a new express router with the standard express middleware's,
   * and the routes set up on the OpenAPI specification.
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
   *       },
   *       routerOptions: {}
   *     }]
   * @returns
   * @memberof BautaJSExpress
   */
  public async buildRouter(
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
      reqGenerator: {
        enabled: true
      },
      routerOptions: {}
    }
  ): Promise<express.Router> {
    const router = express.Router(options.routerOptions);

    initReqIdGenerator(router, this.logger, options.reqGenerator);
    initMorgan(router, options.morgan);
    initHelmet(router, options.helmet);
    initCors(router, options.cors);
    router.use(compression());
    initBodyParser(router, options.bodyParser);

    await this.bootstrap();

    const routes = this.processOperations();

    Object.keys(routes)
      .sort(routeOrder())
      .forEach(route => {
        const methods = Object.keys(routes[route]);
        methods.forEach(method => this.addRoute(routes[route][method], router));
      });

    initExplorer(router, this.apiDefinitions, this.operations, options.explorer);

    return router;
  }
}

export * from './operators';
export * from './types';
export default BautaJSExpress;
