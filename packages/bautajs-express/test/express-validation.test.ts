// eslint-disable-next-line no-unused-vars
import express from 'express';
import path from 'path';
import supertest from 'supertest';
import { BautaJSExpress } from '../src/index';

const apiDefinitionsCustomValidation = require('./fixtures/test-api-definitions-custom-validation.json');

describe('bautaJS express validation tests', () => {
  test('should validate the request with the bautajs validator adding a custom format', async () => {
    const bautajs = new BautaJSExpress({
      apiDefinition: apiDefinitionsCustomValidation,
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
    });

    const router = await bautajs.buildRouter();

    const app = express();
    app.use('/v1', router);
    // Set default error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _: any, res: any, _next: any) => {
      res.json({ message: err.message, status: res.statusCode, errors: err.errors }).end();
    });

    const res = await supertest(app)
      .get('/v1/api/test')
      .query({ limit: 123 })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body.message).toBe('The request was not valid');
    expect(res.body.errors[0]).toStrictEqual({
      path: '/limit',
      location: 'query',
      message: 'must match format "test"',
      errorCode: 'format'
    });
  });

  test('should validate the response with the bautajs validator adding a custom format', async () => {
    const bautajs = new BautaJSExpress({
      apiDefinition: apiDefinitionsCustomValidation,
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-invalid.js'
      )
    });

    const router = await bautajs.buildRouter();

    const app = express();
    app.use('/v1', router);
    // Set default error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _: any, res: any, _next: any) => {
      res.json({ message: err.message, status: res.statusCode, errors: err.errors }).end();
    });

    const res = await supertest(app).get('/v1/api/test').expect('Content-Type', /json/).expect(500);

    expect(res.body.message).toBe('Internal error');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors).toStrictEqual([
      {
        path: '/0/id',
        location: 'response',
        message: 'must be integer',
        errorCode: 'type'
      }
    ]);
  });

  test('should allow modify the response validation error format', async () => {
    const bautajs = new BautaJSExpress({
      apiDefinition: apiDefinitionsCustomValidation,
      customValidationFormats: [{ name: 'test', validate: /[A-Z]/ }],
      resolversPath: path.resolve(
        __dirname,
        './fixtures/test-resolvers/operation-resolver-invalid.js'
      ),
      enableResponseValidation: true,
      onResponseValidationError: err => ({
        message: err.message,
        code: 1234,
        customField: true
      })
    });

    const router = await bautajs.buildRouter();

    const app = express();
    app.use('/v1', router);
    // Set default error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _: any, res: any, _next: any) => {
      res
        .json({ message: err.message, status: res.statusCode, errors: err.errors, code: 1234 })
        .end();
    });

    const res = await supertest(app).get('/v1/api/test').expect('Content-Type', /json/).expect(500);

    expect(res.body).toStrictEqual({
      message: `Internal error`,
      code: 1234,
      customField: true
    });
  });

  test('response validation should be performed after the error handler', async () => {
    const bautajs = new BautaJSExpress({
      apiDefinition: apiDefinitionsCustomValidation,
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
      onResponseValidationError: err => ({
        message: err.message,
        code: err.name,
        customField: true
      })
    });

    const router = await bautajs.buildRouter();

    const app = express();
    app.use('/v1', router);
    // Set default error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _: any, res: any, _next: any) => {
      res
        .status(err.statusCode)
        .json({
          // "code" is missing on the final error. A validation error will be thrown because of that.
          message: err.message,
          status: res.statusCode,
          errors: err.errors,
          fromErrorHandler: true
        })
        .end();
    });

    const res = await supertest(app).get('/v1/api/test').expect('Content-Type', /json/).expect(500);

    expect(res.body).toStrictEqual({
      message: `Internal error`,
      code: 'Validation Error',
      customField: true
    });
  });
});
