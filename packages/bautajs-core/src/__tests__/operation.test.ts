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
import { Readable, Writable } from 'stream';
import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { ObjectWritableMock } from 'stream-mock';
import { OperationBuilder } from '../core/operation';
import { defaultLogger } from '../default-logger';
import { Operation, Route, BautaJSInstance, OpenAPIV3Document } from '../types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testSchemaRareCasesJson from './fixtures/test-schema-rare-cases.json';
import { pipelineBuilder } from '../decorators/pipeline';
import Parser from '../open-api/parser';
import { asPromise } from '../decorators/as-promise';

describe('operation class tests', () => {
  let route: Route;
  const bautaJS: BautaJSInstance = {
    staticConfig: {},
    operations: {},
    logger: defaultLogger(),
    apiDefinitions: [],
    bootstrap() {
      return Promise.resolve();
    },
    decorate() {
      return this;
    }
  };
  beforeEach(async () => {
    const parser = new Parser(bautaJS.logger);
    const document = await parser.asyncParse(testApiDefinitionsJson[0] as OpenAPIV3Document);
    [route] = document.routes;
  });
  describe('build operations cases', () => {
    test('should let you build an operation without schema', async () => {
      const operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      await operationTest.addRoute(route);

      expect(operationTest).toBeInstanceOf(OperationBuilder);
    });

    test('should build the request validator from the schema parameters', async () => {
      const operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};
      const expected = [
        {
          path: '.limit',
          location: 'query',
          message: 'should be integer',
          errorCode: 'type'
        }
      ];
      const ctx = { req, res };
      operationTest.setup(p => p.pipe(() => 'new'));
      await operationTest.addRoute(route);
      await expect(operationTest.run(ctx)).rejects.toThrow(
        expect.objectContaining({ errors: expected })
      );
    });

    test('should build the response validator from the schema response', async () => {
      const operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      const req = {
        prop: 1,
        query: {}
      };
      const res = {};
      const expected = [
        {
          path: '',
          location: 'response',
          message: 'should be array',
          errorCode: 'type'
        }
      ];
      const ctx = { req, res };
      operationTest.validateResponse(true).setup(p => p.push(() => 1));
      await operationTest.addRoute(route);
      await expect(operationTest.run(ctx)).rejects.toThrow(
        expect.objectContaining({ errors: expected })
      );
    });

    test('the default error handler should be a promise reject of the given error', async () => {
      const operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      const error = new Error('someError');
      const ctx = { req: {}, res: {} };
      operationTest.validateRequest(false).setup(p =>
        p.push(() => {
          throw new Error('someError');
        })
      );

      await expect(operationTest.run(ctx)).rejects.toThrow(error);
    });
  });

  describe('operation.setup tests', () => {
    let operationTest: Operation;

    beforeEach(async () => {
      operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      await operationTest.addRoute(route);
    });

    test('should throw an error if the given OperatorFunction fn is undefined', () => {
      // @ts-ignore
      expect(() => operationTest.setup(p => p.push(undefined))).toThrow(
        new Error('An OperatorFunction must be a function.')
      );
    });
    test('pushed OperatorFunctions must be executed in order', async () => {
      const expected = 'this will be showed';
      operationTest.validateRequest(false).setup(p => p.push(() => 'next3').push(() => expected));
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('should allow to push a pipeline', async () => {
      const expected = 'this will be showed';
      const pipe = pipelineBuilder(p => {
        p.push(() => 'next3').push(() => expected);
      });
      operationTest.validateRequest(false).setup(p => p.pushPipeline(pipe));
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('pipeline should be a function', async () => {
      const expected = 'An OperatorFunction must be a function.';
      const pipe = 'string';
      expect(() =>
        operationTest
          // @ts-ignore
          .setup(p => p.pushPipeline(pipe))
      ).toThrow(new Error(expected));
    });
  });

  describe('operation.pipeline.onError tests', () => {
    let operationTest: Operation;
    beforeEach(async () => {
      operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      await operationTest.addRoute(route);
    });
    test('should throw an error if the first argument is not a function', () => {
      const errorHandler = 'String';
      const expected = new Error(`The errorHandler must be a function.`);

      // @ts-ignore
      expect(() => operationTest.setup(p => p.onError(errorHandler))).toThrow(expected);
    });

    test('should set the given error handler', async () => {
      const errorHandler = () => Promise.reject(new Error('error'));
      const ctx = { req: {}, res: {} };
      const expected = new Error('error');
      operationTest
        .validateRequest(false)
        .setup(p => p.push(() => Promise.reject(new Error('crashhh!!!'))).onError(errorHandler));

      await expect(operationTest.run(ctx)).rejects.toThrow(expected);
    });

    test('should be called only onces', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('error'));
      const OperatorFunction1 = () => 'bender';
      const OperatorFunction2 = () => 'bender3';
      const OperatorFunction3 = () => Promise.reject(new Error('crashhh!!!'));
      const OperatorFunction4 = () => 'bender4';
      operationTest
        .validateResponse(false)
        .validateRequest(false)
        .setup(p =>
          p
            .push(OperatorFunction1)
            .push(OperatorFunction2)
            .push(OperatorFunction3)
            .push(OperatorFunction4)
            .onError(errorHandler)
        );
      const ctx = { req: {}, res: {} };

      await expect(operationTest.run(ctx)).rejects.toThrow(new Error('error'));

      expect(errorHandler.mock.calls).toHaveLength(1);
    });

    test('should set the error handler to the inherit operation different from the first operation', async () => {
      const errorHandler = () => Promise.reject(new Error('error'));
      const errorHandlerV2 = () => Promise.reject(new Error('errorV2'));
      const OperatorFunction = () => Promise.reject(new Error('crashhh!!!'));
      operationTest.validateResponse(false).validateRequest(false);
      const operationV2 = OperationBuilder.create(route.operationId, 'v1', bautaJS).validateRequest(
        false
      );

      operationTest.nextVersionOperation = operationV2;

      operationV2.setup(p => p.push(OperatorFunction).onError(errorHandlerV2));
      operationTest.setup(p => p.push(OperatorFunction).onError(errorHandler));
      const ctx = { req: {}, res: {} };

      await expect(operationTest.run(ctx)).rejects.toThrow(new Error('error'));

      await expect(operationV2.run(ctx)).rejects.toThrow(new Error('errorV2'));
    });
  });

  describe('operation.pipeline.pipe tests', () => {
    let operationTest: Operation;
    beforeEach(async () => {
      operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      await operationTest.addRoute(route);
    });
    test('should throw an error on pipe 0 OperatorFunctions', () => {
      const expected = new Error(`At least one OperatorFunction must be specified.`);

      // @ts-ignore
      expect(() => operationTest.setup(p => p.pipe())).toThrow(expected);
    });

    test('should throw an error on pipe a non function', () => {
      const expected = new Error(`An OperatorFunction must be a function.`);

      // @ts-ignore
      expect(() => operationTest.setup(p => p.pipe('string'))).toThrow(expected);
    });

    test('should be able to use previous values', async () => {
      const expected = 10;
      operationTest.validateRequest(false).setup(p =>
        p.pipe(
          () => 5,
          prev => prev + 5
        )
      );
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('should execute the pipe OperatorFunctions in order', async () => {
      const expected = 'this will be showed';
      operationTest.validateRequest(false).setup(p =>
        p.pipe(
          () => 'next3',
          () => expected
        )
      );
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('should allow pipelines on pipe method', async () => {
      const expected = 'this will be showed';
      const pp = pipelineBuilder(p => p.pipe(() => expected));
      operationTest.validateRequest(false).setup(p => p.pipe(() => 'next3', pp));
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('should allow async functions', async () => {
      const expected = 'next3';
      operationTest.validateRequest(false).setup(p => p.pipe(() => Promise.resolve('next3')));
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });
  });

  describe('operation.run tests', () => {
    let operationTest: Operation;
    beforeEach(async () => {
      operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
    });

    test('should allow a context without req', async () => {
      operationTest.validateRequest(false).setup(p => p.push(() => 'good'));
      await operationTest.addRoute(route);
      expect(await operationTest.run({ res: {} })).toStrictEqual('good');
    });

    test('should allow a context without res', async () => {
      operationTest.validateRequest(false).setup(p => p.push(() => 'good'));
      await operationTest.addRoute(route);
      expect(await operationTest.run({ req: {} })).toStrictEqual('good');
    });
  });
  describe('operation ctx.validateRequest tests', () => {
    let operationTest: Operation;
    let document;
    beforeEach(async () => {
      const parser = new Parser(bautaJS.logger);
      document = await parser.asyncParse(testSchemaRareCasesJson as OpenAPIV3Document);
      operationTest = OperationBuilder.create(document.routes[0].operationId, 'v1', bautaJS);
    });

    test('should validate the request by default', async () => {
      operationTest.setup(p =>
        p.push(() => [
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ])
      );

      await operationTest.addRoute(document.routes[0]);
      const expected = [
        {
          path: '',
          location: 'body',
          message: 'should be object',
          errorCode: 'type'
        }
      ];
      const body = null;
      await expect(
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        })
      ).rejects.toThrow(expect.objectContaining({ statusCode: 422, errors: expected }));
    });

    test('should validate an empty body', async () => {
      operationTest.setup(p =>
        p.push(() => [
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ])
      );
      await operationTest.addRoute(document.routes[0]);
      const expected = [
        {
          path: '',
          location: 'body',
          message: "should have required property 'grant_type'",
          errorCode: 'required'
        }
      ];
      const body = {};

      await expect(
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        })
      ).rejects.toThrow(expect.objectContaining({ statusCode: 422, errors: expected }));
    });

    test('should validate against the operation schema', async () => {
      operationTest.setup(p =>
        p.push(() => [
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ])
      );
      await operationTest.addRoute(document.routes[0]);
      const expected = [
        {
          path: '.grant_type',
          location: 'body',
          message: 'should be equal to one of the allowed values',
          errorCode: 'enum'
        }
      ];
      const body = {
        grant_type: 'not valid',
        username: 'user',
        password: 'pass'
      };

      await expect(operationTest.run({ req: { body }, res: {} })).rejects.toThrow(
        expect.objectContaining({ statusCode: 422, errors: expected })
      );
    });

    test('should allow a valid schema', async () => {
      operationTest.validateResponse(false).setup(p =>
        p
          .push((_, ctx) => ctx.validateRequest())
          .push(() => [
            { id: 1, name: '2' },
            { id: 3, name: '2' }
          ])
      );
      await operationTest.addRoute(document.routes[0]);
      const expected = [
        { id: 1, name: '2' },
        { id: 3, name: '2' }
      ];
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      expect(await operationTest.run({ req: { body }, res: {} })).toStrictEqual(expected);
    });

    test('should use default OperatorFunction if setup is not done', async () => {
      operationTest.validateResponse(false);
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      await expect(operationTest.run({ req: { body }, res: {} })).rejects.toThrow(
        new Error('Not found')
      );
    });
  });

  describe('operation ctx.validateResponse tests', () => {
    let operationTest: Operation;
    let streamOperationTest: Operation;
    let emptyResponseContentTest: Operation;
    let document;

    beforeEach(async () => {
      const parser = new Parser(bautaJS.logger);
      document = await parser.asyncParse(testSchemaRareCasesJson as OpenAPIV3Document);

      operationTest = OperationBuilder.create(document.routes[0].operationId, 'v1', bautaJS);
      await operationTest.addRoute(document.routes[0]);

      streamOperationTest = OperationBuilder.create(document.routes[1].operationId, 'v1', bautaJS);
      await streamOperationTest.addRoute(document.routes[1]);

      emptyResponseContentTest = OperationBuilder.create(
        document.routes[2].operationId,
        'v1',
        bautaJS
      );

      await emptyResponseContentTest.addRoute(document.routes[2]);
    });

    test('should validate an not valid response', async () => {
      operationTest.validateRequest(false).validateResponse(true);
      operationTest.setup(p =>
        p
          .push(() => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ])
          .push((response, ctx) => ctx.validateResponse(response, 200))
      );
      await operationTest.addRoute(document.routes[0]);
      const expected = [
        {
          path: '[0]',
          location: 'response',
          message: "should have required property 'id'",
          errorCode: 'required'
        },
        {
          path: '[0]',
          location: 'response',
          message: "should have required property 'name'",
          errorCode: 'required'
        },
        {
          path: '[1]',
          location: 'response',
          message: "should have required property 'id'",
          errorCode: 'required'
        },
        {
          path: '[1]',
          location: 'response',
          message: "should have required property 'name'",
          errorCode: 'required'
        }
      ];
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      await expect(
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        })
      ).rejects.toThrow(expect.objectContaining({ errors: expected }));
    });

    test('should validate an valid response', async () => {
      operationTest.validateRequest(false);
      operationTest.setup(p =>
        p
          .push(() => [
            {
              id: 13,
              name: 'pet'
            },
            {
              id: 45,
              name: 'pet2'
            }
          ])
          .push((response, ctx) => {
            ctx.validateResponse(response);

            return response;
          })
      );
      await operationTest.addRoute(document.routes[0]);
      const expected = [
        {
          id: 13,
          name: 'pet'
        },
        {
          id: 45,
          name: 'pet2'
        }
      ];
      const result = await operationTest.run({
        req: { headers: { 'content-type': 'application/json' } },
        res: {}
      });

      expect(result).toStrictEqual(expected);
    });

    test('should not validate the response if the res.send has been called', async () => {
      operationTest.setup(p =>
        p
          .pipe(() => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ])
          .push((response, ctx) => {
            ctx.res.send(response);

            return response;
          })
      );
      await operationTest.addRoute(document.routes[0]);
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };
      const res = {
        data: null,
        headersSent: false,
        send(data: any) {
          this.headersSent = true;
          this.data = data;
        }
      };

      await operationTest.run({
        req: { query: {}, body, headers: { 'content-type': 'application/json' } },
        res
      });

      expect(res.data).toStrictEqual([
        {
          code: 'boo'
        },
        {
          code: 'foo'
        }
      ]);
    });

    test('should validate that the response when there is no content response in the schema definition', async () => {
      emptyResponseContentTest.setup(p =>
        p.push(() => {
          return null;
        })
      );
      await emptyResponseContentTest.addRoute(document.routes[2]);
      const result = await emptyResponseContentTest.run({
        req: { headers: { 'content-type': 'application/json' } },
        res: { statusCode: 200 }
      });

      expect(result).toBeNull();
    });

    // eslint-disable-next-line jest/no-test-callback
    test('should not validate the response if the response is a stream', done => {
      const {
        input: inputStreamTest,
        expected: expectedStream
        // eslint-disable-next-line global-require
      } = require('./fixtures/test-long-string-stream.json');

      streamOperationTest.setup(p =>
        p
          .push(() => {
            const s = new Readable();
            inputStreamTest.forEach((l: string) => s.push(l));
            s.push(null);
            return s;
          })
          .push(
            asPromise((fileStream, ctx, _, promiseDone) => {
              fileStream.pipe(ctx.res as Writable);
              fileStream.on('end', promiseDone);
              fileStream.on('error', promiseDone);
            })
          )
      );

      const req = httpMocks.createRequest({ headers: { 'content-type': 'application/json' } });
      const res = httpMocks.createResponse({
        eventEmitter: EventEmitter,
        writableStream: ObjectWritableMock,
        req
      });

      res.on('end', function finish() {
        // eslint-disable-next-line no-underscore-dangle
        expect(res._getBuffer().toString()).toStrictEqual(expectedStream);
        done();
      });

      streamOperationTest.run({
        req,
        res
      });
    });
  });
});
