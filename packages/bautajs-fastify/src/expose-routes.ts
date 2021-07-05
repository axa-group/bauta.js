import * as fastify from 'fastify';
import { Operation, ValidationError, Validator, LocationError } from '@bautajs/core';
import routeOrder from 'route-order';
import { ApiHooks } from './types';

export interface ValidationResult {
  validation: fastify.ValidationResult[];
  validationContext: string;
}

function mapFsValidationToLocationErrors(
  validation: ValidationResult
): LocationError[] | undefined {
  return Array.isArray(validation.validation)
    ? validation.validation.map(error => ({
        path: error.dataPath,
        location: validation.validationContext || '',
        message: error.message || '',
        errorCode: error.keyword
      }))
    : undefined;
}

function createHandler(operation: Operation) {
  return async (request: fastify.FastifyRequest, reply: fastify.FastifyReply) => {
    let response;
    // Convert the fastify validation error to the bautajs validation error format
    // @ts-ignore
    if (request.validationError) {
      return reply.status(400).send(
        new ValidationError(
          'The request was not valid',
          // @ts-ignore
          mapFsValidationToLocationErrors(request.validationError) || [],
          400
        ).toJSON()
      );
    }
    const op = operation.run<{ req: fastify.FastifyRequest; res: fastify.FastifyReply }, any>({
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

async function exposeRoutes(
  fastifyInstance: fastify.FastifyInstance,
  opts: {
    prefix: string;
    routes: any;
    validator: Validator<any>;
    strictResponseSerialization?: boolean;
    apiHooks?: ApiHooks;
  }
) {
  function addRoute(operation: Operation, validator: Validator<any>) {
    const method: fastify.HTTPMethods = (operation.route?.method.toUpperCase() ||
      'GET') as fastify.HTTPMethods;
    const { url = '' } = operation.route || {};
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

    if (opts.apiHooks) {
      Object.entries(opts.apiHooks).forEach(([hook, fn]) => {
        fastifyInstance.addHook(hook as any, fn);
      });
    }
    // Use fastify Request validation.
    operation.validateRequest(false);
    const route = (opts.prefix + url).replace(/\/\//, '/');
    fastifyInstance.route({
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

    fastifyInstance.log.info(
      `[OK] [${method.toUpperCase()}] ${route} operation exposed on the API from ${operation.id}`
    );
  }

  Object.keys(opts.routes)
    .sort(routeOrder())
    .forEach(route => {
      const methods = Object.keys(opts.routes[route]);
      methods.forEach(method => addRoute(opts.routes[route][method], opts.validator));
    });
}

export default exposeRoutes;
