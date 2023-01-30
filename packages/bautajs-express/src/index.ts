import compression from 'compression';
import express, { Response, IRoute } from 'express';
import * as bautajs from '@axa/bautajs-core';
import type { Logger as PinoLogger } from 'pino';
import { sortRoutes } from './routes-order';
import {
  RouterOptions,
  ExpressRequest,
  BautaJSExpressOptions,
  OnResponseValidationError
} from './types';
import {
  initReqIdGenerator,
  initExpressPino,
  initBodyParser,
  initHelmet,
  initCors,
  initExplorer
} from './middlewares';
import { getContentType } from './utils';

/**
 * Create an Express server using the BautaJS library with almost 0 configuration
 * @export
 * @class BautaJSExpress
 * @param {BautaJSOptions} options
 * @extends {BautaJS}
 * @example
 * const express = require('express');
 * const { BautaJSExpress } = require('@axa/express');
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
export class BautaJSExpress extends bautajs.BautaJS {
  private onResponseValidationError?: OnResponseValidationError;

  constructor(options: BautaJSExpressOptions) {
    super(options);

    this.onResponseValidationError = options.onResponseValidationError;
  }

  private addRoute(
    operation: bautajs.Operation,
    router: express.Router,
    apiBasePath: string = '/api/'
  ) {
    const method = operation.route?.method.toLowerCase() as keyof Omit<IRoute, 'path' | 'stack'>;
    const responses = operation.route?.schema.response;
    const { url = '' } = operation.route || {};
    const route = (apiBasePath + url).replace(/\/\//, '/');
    router[method](route, (req, res, next) => {
      const sendResponse = res.json.bind(res);

      // Validate the response before sending it to the user.
      res.json = body => {
        if (
          !(res.headersSent || res.finished) &&
          operation.shouldValidateResponse(res.statusCode)
        ) {
          try {
            operation.validateResponseSchema(body, res.statusCode);
          } catch (e: any) {
            // On validation error of the response automatically send 500 status code and format the error.
            // eslint-disable-next-line no-param-reassign
            body = this.onResponseValidationError?.(e, req as ExpressRequest, res) || e;
            res.status(500);
          }
        }

        return sendResponse(body);
      };
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

        return res.end();
      };
      const rejectWrapper = (response: any) => {
        // In case the request was canceled by the user there is no need to send any message to the user.
        if (response.name === 'CancelError') {
          (req as ExpressRequest).log.error(
            {
              message: response.message
            },
            'The request was canceled by the requester.'
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

        return next(response);
      };
      if (operation.shouldValidateRequest()) {
        try {
          operation.validateRequestSchema(req);
        } catch (e: any) {
          res.status(e.statusCode);
          next(e);

          return;
        }
      }

      const op = operation.run<{ req: ExpressRequest; res: Response }, any>({
        req: req as ExpressRequest,
        res,
        id: (req as ExpressRequest).id || req.header('x-request-id'),
        url: (req as ExpressRequest).url,
        log: (req as ExpressRequest).log
      });
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
    });

    this.logger.info(
      `[OK] [${method.toUpperCase()}] ${route} operation exposed on the API from ${operation.id}`
    );
  }

  private processOperations() {
    return Object.keys(this.operations).reduce((routes: any, operationId) => {
      const operation = this.operations[operationId];
      if (!operation.isPrivate() && operation.route) {
        if (!routes[operation.route.url]) {
          // eslint-disable-next-line no-param-reassign
          routes[operation.route.url] = {};
        }
        // eslint-disable-next-line no-param-reassign
        routes[operation.route.url][operation.route.method] = operation;
      }

      return routes;
    }, {});
  }

  /**
   * Create a new express router with the standard express middleware's,
   * and the routes set up on the OpenAPI specification.
   * @async
   * @param {RouterOptions} [options={
   *       cors: {
   *         enabled: true
   *       },
   *       bodyParser: {
   *         enabled: true
   *       },
   *       helmet: {
   *         enabled: true
   *       },
   *       expressPino: {
   *         enabled: true
   *       },
   *       explorer: {
   *         enabled: true
   *       },
   *       routerOptions: {},
   *       apiBasePath: '/api'
   *     }]
   * @returns
   * @memberof BautaJSExpress
   */
  public async buildRouter(
    options: RouterOptions = {
      cors: {
        enabled: true
      },
      bodyParser: {
        enabled: true
      },
      helmet: {
        enabled: true
      },
      expressPino: {
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

    initReqIdGenerator(router, this.logger, options.reqGenerator, options.expressPino);
    initExpressPino(router, this.logger as PinoLogger, options.expressPino);
    initHelmet(router, options.helmet);
    initCors(router, options.cors);
    router.use(compression());
    initBodyParser(router, options.bodyParser);

    await this.bootstrap();

    const routes = this.processOperations();

    sortRoutes(Object.keys(routes)).forEach(route => {
      const methods = Object.keys(routes[route]);
      methods.forEach(method => this.addRoute(routes[route][method], router, options.apiBasePath));
    });

    if (this.apiDefinition) {
      initExplorer(
        router,
        this.apiDefinition,
        this.operations,
        options.apiBasePath,
        options.explorer
      );
    }

    return router;
  }
}

export * from './operators';
export * from './types';
export * from './serializers/req';
export * from './serializers/res';
export default BautaJSExpress;
