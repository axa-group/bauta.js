import * as fastify from 'fastify';
import path from 'path';
import { Operation, ValidationError, Validator, LocationError } from '@axa/bautajs-core';
import { ApiHooks, OnResponseValidationError } from './types';

// We are using ajv 8 and dataPath is moved to instancePath
export interface ValidateError extends fastify.ValidationResult {
  instancePath: string;
}

export interface ValidationResult {
  validation: ValidateError[];
  validationContext: string;
}

function mapFsValidationToLocationErrors(
  validation: ValidationResult
): LocationError[] | undefined {
  return Array.isArray(validation.validation)
    ? validation.validation.map(error => ({
        path: error.schemaPath || error.instancePath,
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
      // This error is intentionally logged as trace because for most of the errors is an expected error
      request.log.trace(
        {
          error: {
            name: request.validationError.name,
            message: request.validationError.message,
            stack: request.validationError.stack
          }
        },
        `Fastify schema validation error found on the request`
      );

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
      id: (request.id || request.headers['x-request-id']) as string,
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
        reply.hijack();
        return {};
      }

      // if the response is not defined return empty string by default
      if (response === undefined) {
        return '';
      }

      return response;
    } catch (error: any) {
      if (error.name === 'CancelError') {
        request.log.error(
          {
            message: error.message
          },
          'The request was canceled by the requester.'
        );
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
        reply.hijack();
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
    apiBasePath: string;
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
    const requestSchema: any = {};
    // Avoid defining the request schema member as undefined
    // to prevent https://github.com/fastify/fastify/issues/4634
    if (operation.route?.schema && operation.requestValidationEnabled) {
      if (operation.route?.schema.body) {
        requestSchema.body = operation.route?.schema.body;
      }

      if (operation.route?.schema.params) {
        requestSchema.params = operation.route?.schema.params;
      }

      if (operation.route?.schema.headers) {
        requestSchema.headers = operation.route?.schema.headers;
      }

      if (operation.route?.schema.querystring) {
        requestSchema.querystring = operation.route?.schema.querystring;
      }
    }

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
        } catch (e: any) {
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
    const route = path.posix.join(opts.apiBasePath, url);
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
      url: route,
      preSerialization: preSerializationHooks,
      handler: createHandler(operation),
      schema: {
        ...requestSchema,
        ...(opts.strictResponseSerialization !== false ? responseSchema : {})
      }
    });

    fastifyInstance.log.info(
      `[OK] [${method.toUpperCase()}] ${path.posix.join(
        fastifyInstance.prefix,
        route
      )} operation exposed on the API from ${operation.id}`
    );
  }

  Object.keys(opts.routes).forEach(route => {
    const methods = Object.keys(opts.routes[route]);
    methods.forEach(method => addRoute(opts.routes[route][method], opts.validator));
  });
}

export default exposeRoutes;
