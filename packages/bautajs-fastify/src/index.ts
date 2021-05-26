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
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  HTTPMethods,
  ValidationResult
} from 'fastify';
import responseXRequestId from 'fastify-x-request-id';
import routeOrder from 'route-order';
import * as bautaJS from '@bautajs/core';
import explorerPlugin from './explorer';

export interface ValidationObject {
  validation: ValidationResult[];
  validationContext: string;
}

function formatLocationErrors(validation: ValidationObject): bautaJS.LocationError[] | undefined {
  return Array.isArray(validation.validation)
    ? validation.validation.map(error => ({
        path: error.dataPath,
        location: validation.validationContext || '',
        message: error.message || '',
        errorCode: error.keyword
      }))
    : undefined;
}

export interface BautaJSFastifyPluginOptions
  extends Omit<bautaJS.BautaJSOptions, 'getRequest' | 'getResponse'> {
  /**
   * In case an openAPI schema or an schema is provided to the routes, enable this flag will use it to serialize and validate the response.
   * - If this is enabled and response is not complaint with the schema, an error will be returned. Enable it will "IMPROVE THE PERFORMANCE".
   * - If this is disabled responses will be serialized with a normal stringify method.
   * @default false
   * @type {boolean}
   * @memberof BautaJSFastifyPluginOptions
   */
  enableResponseValidation?: boolean;
  /**
   * Automatically expose the bautajs operations as an endpoint.
   * @default true
   * @type {boolean}
   * @memberof BautaJSFastifyPluginOptions
   */
  exposeOperations?: boolean;
  explorer?: {
    enabled: boolean;
  };
  /**
   * Referees to the API base path
   * @default "/api/"
   * @type string
   * @memberof BautaJSFastifyPluginOptions
   */
  apiBasePath?: string;
  /**
   * Referees to the root path of your Application. It can be used to split the api in different versions such 'v1', 'v2'...
   * @default ""
   * @type string
   * @memberof BautaJSFastifyPluginOptions
   */
  prefix?: string;

  /**
   * If set to true, responses schemas will be add it to fastify instance making the response serialization strict by cutting out
   * all properties not present on the schema. See more info on https://github.com/fastify/fastify/blob/main/docs/Validation-and-Serialization.md#serialization
   *
   * @type {boolean}
   * @default true
   * @memberof BautaJSFastifyPluginOptions
   */
  strictResponseSerialization?: boolean;
}

function processOperations(operations: bautaJS.Operations) {
  return Object.keys(operations).reduce((routes: any, operationId) => {
    const operation = operations[operationId];
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

function createHandler(operation: bautaJS.Operation) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    let response;
    // Convert the fastify validation error to the bautajs validation error format
    // @ts-ignore
    if (request.validationError) {
      return reply.status(422).send(
        new bautaJS.ValidationError(
          'The request was not valid',
          // @ts-ignore
          formatLocationErrors(request.validationError) || [],
          422
        ).toJSON()
      );
    }
    const op = operation.run<{ req: FastifyRequest; res: FastifyReply }, any>({
      req: request,
      res: reply,
      id: request.id || request.headers['x-request-id'],
      url: request.url,
      log: request.log
    });
    request.raw.on('abort', () => {
      op.cancel('Request was aborted by the requester intentionally');
    });
    request.raw.on('aborted', () => {
      op.cancel('Request was aborted by the requester intentionally');
    });
    request.raw.on('timeout', () => {
      op.cancel('Request was aborted by the requester because of a timeout');
    });

    try {
      response = await op;

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
        request.log.error(`The request to ${request.raw.url} was canceled by the requester`);
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

export async function bautajsFastify(fastify: FastifyInstance, opts: BautaJSFastifyPluginOptions) {
  const prefix = opts.prefix || '';
  function addRoute(operation: bautaJS.Operation, validator: bautaJS.Validator<any>) {
    const method: HTTPMethods = (operation.route?.method.toUpperCase() || 'GET') as HTTPMethods;
    const { url = '' } = operation.route || {};
    const basePath = `${prefix}${opts.apiBasePath || '/api/'}`.replace(/\/\//, '/');
    const requestSchema =
      operation.route?.schema && operation.requestValidationEnabled
        ? {
            body: operation.route?.schema.body,
            params: operation.route?.schema.params,
            headers: operation.route?.schema.headers,
            querystring: operation.route?.schema.querystring
          }
        : {};

    const responseSchema = operation.route?.schema
      ? { response: operation.route?.schema.response }
      : {};
    // Use fastify Request validation.
    operation.validateRequest(false);

    fastify.register(
      async fastifyAPI => {
        const route = (basePath + url).replace(/\/\//, '/');
        fastifyAPI.route({
          validatorCompiler: ({ schema }) => validator.buildSchemaCompiler(schema),
          attachValidation: true,
          method,
          url,
          handler: createHandler(operation),
          schema: {
            ...requestSchema,
            ...(opts.strictResponseSerialization !== false ? responseSchema : {})
          }
        });

        fastify.log.info(
          `[OK] [${method.toUpperCase()}] ${route} operation exposed on the API from ${
            operation.id
          }`
        );
      },
      {
        prefix: basePath
      }
    );
  }
  const bautajs = new bautaJS.BautaJS({
    // Cast should be done because interface of fastify is wrong https://github.com/fastify/fastify/issues/1715
    logger: fastify.log as bautaJS.Logger,
    ...opts,
    getRequest(raw) {
      return raw.req;
    },
    getResponse(raw) {
      return {
        statusCode: raw.res.statusCode,
        isResponseFinished: raw.res.sent
      };
    }
  });

  await bautajs.bootstrap();

  // Add x-request-id on the response
  fastify.register(responseXRequestId, { prefix });

  if (opts.apiDefinition && (!opts.explorer || opts.explorer.enabled)) {
    fastify.register(explorerPlugin, {
      prefix,
      apiDefinition: opts.apiDefinition,
      operations: bautajs.operations
    });
  }

  if (opts.exposeOperations !== false) {
    const routes = processOperations(bautajs.operations);
    Object.keys(routes)
      .sort(routeOrder())
      .forEach(route => {
        const methods = Object.keys(routes[route]);
        methods.forEach(method => addRoute(routes[route][method], bautajs.validator));
      });
  }

  // This will give access to some fastify features inside the pipelines
  bautajs.decorate('fastify', fastify);
}

export * from './operators';
export default fp(bautajsFastify, {
  fastify: '3.x',
  name: 'bautajs'
});
