import * as fastify from 'fastify';
import { Operation, ValidationError, Validator, LocationError } from '@bautajs/core';
import routeOrder from 'route-order';
import { ApiHooks, OnResponseValidationError } from './types';

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
    if (request.validationError) {
      reply.status(400);
      throw new ValidationError(
        'The request was not valid',
        mapFsValidationToLocationErrors(request.validationError) || [],
        400
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
      if (reply.sent || reply.raw.headersSent || reply.raw.finished) {
        // In case reply was sent by reply.raw
        // eslint-disable-next-line no-param-reassign
        reply.sent = true;
        return {};
      }

      // if the response is not defined return empty string by default
      if (response === undefined) {
        return '';
      }

      return response;
    } catch (error) {
      if (error.name === 'CancelError') {
        request.log.error(`The request was canceled by the requester.`);
        return {};
      }

      if (reply.sent || reply.raw.headersSent || reply.raw.finished) {
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
        // In case reply was sent by reply.raw
        // eslint-disable-next-line no-param-reassign
        reply.sent = true;
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
    onResponseValidationError?: OnResponseValidationError;
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
    const validateResponseHook = (
      req: fastify.FastifyRequest,
      reply: fastify.FastifyReply,
      payload: any,
      done: any
    ) => {
      if (!reply.sent && operation.shouldValidateResponse(reply.statusCode)) {
        try {
          operation.validateResponseSchema(payload, reply.statusCode);
        } catch (e) {
          // On validation error of the response automatically send 500 status code and format the error.
          const error = opts.onResponseValidationError?.(e, req, reply) || e;
          reply.status(500);
          return done(null, error);
        }
      }
      return done(null, payload);
    };

    if (opts.apiHooks) {
      Object.entries(opts.apiHooks).forEach(([hook, fn]) => {
        fastifyInstance.addHook(hook as any, fn);
      });
    }
    const route = (opts.prefix + url).replace(/\/\//, '/');
    const preSerializationHooks = [];
    if (opts.apiHooks) {
      if (Array.isArray(opts.apiHooks.preSerialization)) {
        preSerializationHooks.push(...opts.apiHooks.preSerialization);
      } else if (opts.apiHooks.preSerialization) {
        preSerializationHooks.push(opts.apiHooks.preSerialization);
      }
    }
    // Response validation should be the final one
    preSerializationHooks.push(validateResponseHook);

    fastifyInstance.route({
      validatorCompiler: ({ schema }) => validator.buildSchemaCompiler(schema),
      attachValidation: true,
      method,
      url,
      preSerialization: preSerializationHooks,
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
