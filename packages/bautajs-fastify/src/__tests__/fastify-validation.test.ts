import path from 'path';
import fastify, { FastifyInstance } from 'fastify';
import { ValidationError } from '@axa/bautajs-core';
import { bautajsFastify } from '../index';

const apiDefinitionCustomValidation = require('./fixtures/test-api-definitions-custom-validation.json');

describe('bautaJS fastify tests', () => {
  let fastifyInstance: FastifyInstance<any>;
  beforeEach(() => {
    fastifyInstance = fastify();
  });
  afterEach(() => {
    fastifyInstance.close();
  });

  test('should validate the request with the internal fastify validator but allowing custom format', async () => {
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      apiDefinition: apiDefinitionCustomValidation,
      resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
    });

    fastifyInstance.setErrorHandler((err: ValidationError, _req, reply) => {
      reply.status(err.statusCode || 500);
      reply.send(err.toJSON());
    });

    const res = (await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test',
      query: {
        // @ts-ignore
        limit: 123
      }
    })) as any;
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(body.message).toBe('The request was not valid');
    expect(body.errors[0]).toStrictEqual({
      location: 'querystring',
      message: 'must match format "test"',
      errorCode: 'format',
      path: '#/properties/limit/format'
    });
  });

  test('request validation errors should pass through the error handler', async () => {
    const spy = jest.fn();
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      apiDefinition: apiDefinitionCustomValidation,
      resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
    });

    fastifyInstance.setErrorHandler((err: ValidationError, _req, reply) => {
      spy(null);

      reply.status(err.statusCode || 500);
      reply.send(err.toJSON());
    });

    const res = (await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test',
      query: {
        // @ts-ignore
        limit: 123
      }
    })) as any;

    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(400);
    expect(body.message).toBe('The request was not valid');
    expect(body.errors[0]).toStrictEqual({
      location: 'querystring',
      message: 'must match format "test"',
      errorCode: 'format',
      path: '#/properties/limit/format'
    });
    expect(spy).toHaveBeenCalledWith(null);
  });

  test('should validate the response with bautajs validator', async () => {
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      apiDefinition: apiDefinitionCustomValidation,
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-invalid.js'
      ),
      enableResponseValidation: true
    });

    const res = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });
    const body = JSON.parse(res.body);
    expect(res.statusCode).toBe(500);
    expect(body.message).toBe('Internal error');
    expect(body.errors).toStrictEqual([
      {
        path: '/0/id',
        errorCode: 'type',
        location: 'response',
        message: 'must be integer'
      }
    ]);
  });
  test('response validation should be disabled by default', async () => {
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      apiDefinition: apiDefinitionCustomValidation,
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-invalid.js'
      ),
      strictResponseSerialization: false
    });

    const res = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });

    expect(res.statusCode).toBe(200);
  });

  test('should allow modify the response validation error format', async () => {
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      apiDefinition: apiDefinitionCustomValidation,
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-invalid.js'
      ),
      enableResponseValidation: true,
      strictResponseSerialization: false,
      onResponseValidationError: err => ({
        message: err.message,
        code: 'Error code',
        customField: true
      })
    });

    const res = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toStrictEqual({
      message: `Internal error`,
      code: 'Error code',
      customField: true
    });
  });
  test('response validation should be performed after the error handler', async () => {
    fastifyInstance.register(bautajsFastify, {
      apiBasePath: '/api/',
      prefix: '/v1/',
      apiDefinition: apiDefinitionCustomValidation,
      resolvers: [
        operations => {
          operations.operation1.setup(() => {
            const error = new Error('test') as any;
            error.statusCode = 400;

            throw error;
          });
        }
      ],
      enableResponseValidation: true,
      strictResponseSerialization: false,
      onResponseValidationError: err => ({
        message: err.message,
        code: err.name,
        customField: true
      })
    });

    fastifyInstance.setErrorHandler((err: any, _request, reply) => {
      reply.status(err.statusCode).send({
        // "message" is missing on the final error. A validation error will be thrown because of that.
        status: reply.statusCode,
        errors: err.errors,
        fromErrorHandler: true
      });
    });

    const res = await fastifyInstance.inject({
      method: 'GET',
      url: '/v1/api/test'
    });

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res.body)).toStrictEqual({
      message: `Internal error`,
      code: 'Validation Error',
      customField: true
    });
  });
});
