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
import { Operation, Route, BautaJSInstance, OpenAPIV3Document, RawContext } from '../types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testSchemaRareCasesJson from './fixtures/test-schema-rare-cases.json';
import { pipe } from '../index';
import Parser from '../open-api/parser';
import { asPromise } from '../operators/as-promise';
import { AjvValidator } from '../open-api/ajv-validator';

describe('operation class tests', () => {
  let route: Route;
  let bautaJS: BautaJSInstance;

  beforeEach(async () => {
    bautaJS = {
      staticConfig: {},
      operations: {},
      logger: defaultLogger(),
      apiDefinitions: [],
      validator: new AjvValidator(),
      options: {
        getRequest(raw: any): any {
          return raw.req;
        },
        getResponse(raw: any) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      },
      bootstrap() {
        return Promise.resolve();
      },
      decorate() {
        return this;
      }
    };
    const parser = new Parser(bautaJS.logger);
    const document = await parser.asyncParse(testApiDefinitionsJson[0] as OpenAPIV3Document);
    [route] = document.routes;
  });

  describe('build operations cases', () => {
    test('should let you build an operation without schema', async () => {
      const operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      operationTest.addRoute(route);

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
      const data = { req, res };
      operationTest.setup(() => 'new');
      operationTest.addRoute(route);
      expect(() => operationTest.run(data)).toThrow(expect.objectContaining({ errors: expected }));
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
      operationTest.validateResponse(true).setup(() => 1);
      operationTest.addRoute(route);
      expect(() => operationTest.run(ctx)).toThrow(expect.objectContaining({ errors: expected }));
    });

    test('the default error handler should be a promise reject of the given error', async () => {
      const operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      const error = new Error('someError');
      const ctx = { req: {}, res: {} };
      operationTest.validateRequest(false).setup(() => {
        throw new Error('someError');
      });

      expect(() => operationTest.run(ctx)).toThrow(error);
    });
  });

  describe('operation.setup tests', () => {
    let operationTest: Operation;

    beforeEach(async () => {
      operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
      operationTest.addRoute(route);
    });

    test('should throw an error if the given Pipeline.StepFunction fn is undefined', () => {
      // @ts-ignore
      expect(() => operationTest.setup(undefined)).toThrow(
        new Error('"step" must be a Pipeline.StepFunction.')
      );
    });
    test('pushed Pipeline.StepFunctions must be executed in order', async () => {
      const expected = 'this will be showed';
      operationTest.validateRequest(false).setup(
        pipe(
          () => 'next3',
          () => expected
        )
      );
      const ctx = { req: {}, res: {} };

      expect(operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('should allow to setup a pipeline build with pipe', async () => {
      const expected = 'this will be showed';
      const pipeline = pipe(
        () => 'next3',
        () => expected
      );
      operationTest.validateRequest(false).setup(pipeline);
      const ctx = { req: {}, res: {} };

      expect(operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('step should be a function', async () => {
      const expected = '"step" must be a Pipeline.StepFunction.';
      const wrongStep = 'string';
      expect(() =>
        operationTest
          // @ts-ignore
          .setup(wrongStep)
      ).toThrow(new Error(expected));
    });
  });

  describe('operation.run tests', () => {
    let operationTest: Operation;
    beforeEach(async () => {
      operationTest = OperationBuilder.create(route.operationId, 'v1', bautaJS);
    });

    test('should allow to run without getRequest', async () => {
      const op = OperationBuilder.create(route.operationId, 'v1', {
        ...bautaJS,
        options: {
          getResponse(raw: any) {
            return {
              statusCode: raw.res.statusCode,
              isResponseFinished: raw.res.headersSent || raw.res.finished
            };
          }
        }
      });
      op.validateRequest(false).setup(() => 'good');
      op.addRoute(route);
      expect(op.run({ res: {} })).toStrictEqual('good');
    });

    test('should allow to run without getResponse', async () => {
      const op = OperationBuilder.create(route.operationId, 'v1', {
        ...bautaJS,
        options: {
          getRequest(raw: any): any {
            return raw.req;
          }
        }
      });
      op.validateRequest(false).setup(() => 'good');
      op.addRoute(route);
      expect(op.run({ res: {} })).toStrictEqual('good');
    });

    test('should return a promise if there is some promise on some of the steps', async () => {
      operationTest.validateRequest(false).setup(
        pipe(
          () => {
            return 'sounds good';
          },
          async prev => {
            return new Promise(resolveP => setTimeout(() => resolveP(prev), 10));
          }
        )
      );
      operationTest.addRoute(route);
      const result = operationTest.run({
        req: {},
        res: {
          statusCode: 200
        }
      });
      expect(result).toBeInstanceOf(Promise);
      expect(await result).toStrictEqual('sounds good');
    });

    test('should return a value if there is no promise as part of the pipeline', async () => {
      operationTest.validateRequest(false).setup(() => 'good');
      operationTest.addRoute(route);
      const result = operationTest.run({ req: {}, res: {} });
      expect(result).not.toBeInstanceOf(Promise);
      expect(await result).toStrictEqual('good');
    });
  });
  describe('operation ctx.validateRequest tests', () => {
    let operationTest: Operation;
    let document: any;

    beforeEach(async () => {
      const parser = new Parser(bautaJS.logger);
      document = await parser.asyncParse(testSchemaRareCasesJson as OpenAPIV3Document);
      operationTest = OperationBuilder.create(document.routes[0].operationId, 'v1', bautaJS);
    });

    test('should validate the request by default', async () => {
      operationTest.setup(
        pipe(() => [
          {
            code: 'boo'
          },
          {
            code: 'foo'
          }
        ])
      );

      operationTest.addRoute(document.routes[0]);
      const expected = [
        {
          path: '',
          location: 'body',
          message: 'should be object',
          errorCode: 'type'
        }
      ];
      const body = null;
      expect(() =>
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        })
      ).toThrow(expect.objectContaining({ statusCode: 422, errors: expected }));
    });

    test('should validate an empty body', async () => {
      operationTest.setup(
        pipe(() => [
          {
            code: 'boo'
          },
          {
            code: 'foo'
          }
        ])
      );
      operationTest.addRoute(document.routes[0]);
      const expected = [
        {
          path: '',
          location: 'body',
          message: "should have required property 'grant_type'",
          errorCode: 'required'
        }
      ];
      const body = {};

      expect(() =>
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        })
      ).toThrow(expect.objectContaining({ statusCode: 422, errors: expected }));
    });

    test('should validate against the operation schema', async () => {
      operationTest.setup(
        pipe(() => [
          {
            code: 'boo'
          },
          {
            code: 'foo'
          }
        ])
      );
      operationTest.addRoute(document.routes[0]);
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

      expect(() => operationTest.run({ req: { body }, res: {} })).toThrow(
        expect.objectContaining({ statusCode: 422, errors: expected })
      );
    });

    test('should allow a valid schema', async () => {
      operationTest.validateResponse(false).setup(
        pipe(
          (_, ctx) =>
            ctx.validateRequestSchema((ctx as RawContext<{ req: any; res: any }>).raw.req),
          () => [
            { id: 1, name: '2' },
            { id: 3, name: '2' }
          ]
        )
      );
      operationTest.addRoute(document.routes[0]);
      const expected = [
        { id: 1, name: '2' },
        { id: 3, name: '2' }
      ];
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      expect(operationTest.run({ req: { body }, res: {} })).toStrictEqual(expected);
    });

    test('should use default Pipeline.StepFunction if setup is not done', async () => {
      operationTest.validateResponse(false);
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      expect(() => operationTest.run({ req: { body }, res: {} })).toThrow(new Error('Not found'));
    });
  });

  describe('operation ctx.validateResponse tests', () => {
    let operationTest: Operation;
    let streamOperationTest: Operation;
    let emptyResponseContentTest: Operation;
    let document: any;

    beforeEach(async () => {
      const parser = new Parser(bautaJS.logger);
      document = await parser.asyncParse(testSchemaRareCasesJson as OpenAPIV3Document);

      operationTest = OperationBuilder.create(document.routes[0].operationId, 'v1', bautaJS);
      operationTest.addRoute(document.routes[0]);

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
      operationTest.setup(
        pipe(
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ],
          (response, ctx) => ctx.validateResponseSchema(response, 200)
        )
      );
      operationTest.addRoute(document.routes[0]);
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

      expect(() =>
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        })
      ).toThrow(expect.objectContaining({ errors: expected }));
    });

    test('should validate an valid response', async () => {
      operationTest.validateRequest(false);
      operationTest.setup(
        pipe(
          () => [
            {
              id: 13,
              name: 'pet'
            },
            {
              id: 45,
              name: 'pet2'
            }
          ],
          (response, ctx) => {
            ctx.validateResponseSchema(response);

            return response;
          }
        )
      );
      operationTest.addRoute(document.routes[0]);
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
      const result = operationTest.run({
        req: { headers: { 'content-type': 'application/json' } },
        res: {}
      });

      expect(result).toStrictEqual(expected);
    });

    test('should not validate the response if the res.send has been called', async () => {
      operationTest.setup(
        pipe(
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ],
          (response, ctx) => {
            (ctx as RawContext<{ req: any; res: any }>).raw.res?.send(response);

            return response;
          }
        )
      );
      operationTest.addRoute(document.routes[0]);
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

      operationTest.run({
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
      emptyResponseContentTest.setup(() => {
        return null;
      });
      await emptyResponseContentTest.addRoute(document.routes[2]);
      const result = emptyResponseContentTest.run({
        req: { headers: { 'content-type': 'application/json' } },
        res: { statusCode: 200 }
      });

      expect(result).toBeNull();
    });

    // eslint-disable-next-line jest/no-done-callback
    test('should not validate the response if the response is a stream', done => {
      const {
        input: inputStreamTest,
        expected: expectedStream
        // eslint-disable-next-line global-require
      } = require('./fixtures/test-long-string-stream.json');

      streamOperationTest.setup(
        pipe(
          () => {
            const s = new Readable();
            inputStreamTest.forEach((l: string) => s.push(l));
            s.push(null);
            return s;
          },
          asPromise((fileStream, ctx, _, promiseDone) => {
            fileStream.pipe((ctx as RawContext<{ req: any; res: any }>).raw.res as Writable);
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
