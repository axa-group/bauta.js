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
import fp from 'fastify-plugin';
import helmet, { FastifyHelmetOptions } from 'fastify-helmet';
import { FastifyInstance, FastifyReply, FastifyRequest, HTTPMethod } from 'fastify';
import responseXRequestId from 'fastify-x-request-id';
import routeOrder from 'route-order';
import {
  BautaJS,
  BautaJSOptions,
  Document,
  Operations,
  Operation,
  utils,
  Logger
} from '@bautajs/core';
import { FastifyOASOptions } from 'fastify-oas';
import sensible from 'fastify-sensible';
import explorerPlugin from './explorer';

export interface BautaJSFastifyPluginOptions extends BautaJSOptions {
  apiDefinitions: Document[];
  /**
   * Automatically expose the buatajs operations as an endpoint.
   * @default true
   * @type {boolean}
   */
  exposeOperations?: boolean;
  helmet?: {
    enabled: boolean;
    options?: FastifyHelmetOptions;
  };
  explorer?: {
    enabled: boolean;
    options?: FastifyOASOptions;
  };
  sensible?: {
    enabled: boolean;
    options?: {
      /**
       * Set a default error handler that will manage sensible plugin errors for you.
       * @default true
       * @type {boolean}
       */
      errorHandler: boolean;
    };
  };
}

function processOperations(operations: Operations) {
  const routes: any = {};
  Object.values(operations).forEach(versions => {
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
  });

  return routes;
}

function createHandler(operation: Operation) {
  return async (request: FastifyRequest, reply: FastifyReply<any>) => {
    const op = operation.run({ req: request, res: reply });
    request.req.on('abort', () => {
      op.cancel('Request was aborted by the requester intentionally');
    });
    request.req.on('aborted', () => {
      op.cancel('Request was aborted by the requester intentionally');
    });
    request.req.on('timeout', () => {
      op.cancel('Request was aborted by the requester because of a timeout');
    });

    try {
      const response = await op;
      // In case the response is already sent to the user don't send it again.
      if (reply.sent) {
        return {};
      }

      // if the response is not defined return empty string by default
      if (response === undefined) {
        return '';
      }

      return response;
    } catch (error) {
      if (error.name === 'CancelError') {
        request.log.error(`The request to ${request.req.url} was canceled by the requester`);
        return {};
      }

      if (reply.sent) {
        request.log.error(
          {
            error: {
              name: error.name,
              code: error.code,
              message: error.message
            }
          },
          `Response has been sent to the requester, but the promise threw an error`
        );
        return {};
      }
      reply.status(error.statusCode || 500);
      throw error;
    }
  };
}

export async function bautajsFastify(
  fastify: FastifyInstance,
  { apiDefinitions, ...opts }: BautaJSFastifyPluginOptions
) {
  function addRoute(operation: Operation) {
    const method: HTTPMethod = (operation.route?.method.toUpperCase() || 'GET') as HTTPMethod;
    const { url = '', basePath = '' } = operation.route || {};
    const requestSchema = operation.requestValidationEnabled
      ? {
          body: operation.route?.schema.body,
          params: operation.route?.schema.params,
          headers: operation.route?.schema.headers,
          querystring: operation.route?.schema.querystring
        }
      : {};

    // Use fastify Request validation and serialization.
    operation.validateRequest(false);

    fastify.register(
      async fastifyAPI => {
        const route = (basePath + url).replace(/\/\//, '/');
        fastifyAPI.route({
          method,
          url,
          handler: createHandler(operation),
          schema: {
            ...requestSchema,
            response: operation.route?.schema.response
          },
          logSerializers: {
            res(res: any) {
              return {
                statusCode: res.statusCode,
                url: route
              };
            }
          }
        });

        fastify.log.info(
          `[OK] [${method.toUpperCase()}] ${route} operation exposed on the API from ${
            operation.version
          }.${operation.id}`
        );
      },
      {
        prefix: basePath
      }
    );
  }

  const bautajs = new BautaJS(apiDefinitions, {
    ...opts,
    // Cast should be done because interface of fastify is wrong https://github.com/fastify/fastify/issues/1715
    logger: fastify.log as Logger
  });
  await bautajs.bootstrap();
  // Include bautajs instance inside fastify instance
  fastify.decorate('bautajs', bautajs);
  fastify.setSchemaCompiler(schema => utils.buildSchemaCompiler(schema));
  // Add x-request-id on the response
  fastify.register(responseXRequestId);

  if (!opts.helmet || opts.helmet.enabled) {
    fastify.register(helmet, opts.helmet?.options);
  }

  if (!opts.explorer || opts.explorer.enabled) {
    fastify.register(explorerPlugin, {
      apiDefinitions,
      operations: bautajs.operations,
      oasOptions: opts.explorer?.options
    });
  }
  if (!opts.sensible || opts.sensible.enabled) {
    fastify.register(sensible, opts.sensible?.options);
  }

  if (opts.exposeOperations !== false) {
    const routes = processOperations(bautajs.operations);
    Object.keys(routes)
      .sort(routeOrder())
      .forEach(route => {
        const methods = Object.keys(routes[route]);
        methods.forEach(method => addRoute(routes[route][method]));
      });
  }
  // This will give access to some fastify features inside the pipelines
  bautajs.decorate('fastify', fastify);
}

export default fp(bautajsFastify, {
  fastify: '2.x',
  name: 'bautajs'
});
