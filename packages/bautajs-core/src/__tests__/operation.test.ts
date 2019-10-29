/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { OpenAPI, OpenAPIV3 } from 'openapi-types';
import { OperationBuilder } from '../core/operation';
import { logger } from '../index';
import { OpenAPIComponents, OpenAPIV3Document, Operation } from '../utils/types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testSchemaBodyJson from './fixtures/test-schema-body.json';
import { pipelineBuilder } from '../decorators/pipeline';

describe('operation class tests', () => {
  let operationSchema: OpenAPI.Operation;
  let schemaComponents: OpenAPIComponents;
  beforeEach(() => {
    operationSchema = { ...(testApiDefinitionsJson[0] as OpenAPIV3Document).paths['/test'].get };
    schemaComponents = {
      ...((testApiDefinitionsJson[0] as OpenAPIV3Document)
        .components as OpenAPIV3.ComponentsObject),
      swaggerVersion: '3',
      apiVersion: 'v1'
    };
  });
  describe('build operations cases', () => {
    test('should let you build an operation without schema', () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        operationSchema,
        schemaComponents,
        {
          staticConfig: {},
          operations: {},
          logger,
          apiDefinitions: []
        }
      );

      expect(operationTest).toBeInstanceOf(OperationBuilder);
    });

    test('should build the request validator from the schema parameters', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        operationSchema,
        schemaComponents,
        {
          staticConfig: {},
          operations: {},
          logger,
          apiDefinitions: []
        }
      );
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};
      const expected = [
        {
          errorCode: 'type.openapi.validation',
          location: 'query',
          message: 'should be integer',
          path: 'limit'
        }
      ];
      const ctx = { req, res };
      await expect(operationTest.run(ctx)).rejects.toThrow(
        expect.objectContaining({ errors: expected })
      );
    });

    test('should build the response validator from the schema response', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        operationSchema,
        schemaComponents,
        {
          staticConfig: {},
          operations: {},
          logger,
          apiDefinitions: []
        }
      );
      const req = {
        prop: 1
      };
      const res = {};
      const expected = [
        {
          path: 'response',
          errorCode: 'type.openapi.responseValidation',
          message: 'should be array'
        }
      ];
      const ctx = { req, res };
      operationTest.setup(p => p.push(() => 1));
      await expect(operationTest.run(ctx)).rejects.toThrow(
        expect.objectContaining({ errors: expected })
      );
    });

    test('the default error handler should be a promise reject of the given error', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        operationSchema,
        schemaComponents,
        {
          staticConfig: {},
          operations: {},
          logger,
          apiDefinitions: []
        }
      );
      const error = new Error('someError');
      const ctx = { req: {}, res: {} };
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p =>
          p.push(() => {
            throw new Error('someError');
          })
        );

      await expect(operationTest.run(ctx)).rejects.toThrow(error);
    });
  });

  describe('operation.setup tests', () => {
    let operationTest: Operation;

    beforeEach(() => {
      operationTest = OperationBuilder.create('operation1', operationSchema, schemaComponents, {
        staticConfig: {},
        operations: {},
        logger,
        apiDefinitions: []
      });
    });

    test('should throw an error if the given OperatorFunction fn is undefined', () => {
      // @ts-ignore
      expect(() => operationTest.setup(p => p.push(undefined))).toThrow(
        new Error('An OperatorFunction must be a function.')
      );
    });
    test('pushed OperatorFunctions must be executed in order', async () => {
      const expected = 'this will be showed';
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p => p.push(() => 'next3').push(() => expected));
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('should allow to push a pipeline', async () => {
      const expected = 'this will be showed';
      const pipe = pipelineBuilder(p => {
        p.push(() => 'next3').push(() => expected);
      });
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p => p.pushPipeline(pipe));
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
    beforeEach(() => {
      operationTest = OperationBuilder.create('operation1', operationSchema, schemaComponents, {
        staticConfig: {},
        operations: {},
        logger,
        apiDefinitions: []
      });
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
        .validateResponses(false)
        .validateRequests(false)
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
        .validateResponses(false)
        .validateRequests(false)
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
      operationTest.validateResponses(false).validateRequests(false);
      const operationV2 = OperationBuilder.create('operation1', operationSchema, schemaComponents, {
        staticConfig: {},
        operations: {},
        logger,
        apiDefinitions: []
      })
        .validateResponses(false)
        .validateRequests(false);

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
    beforeEach(() => {
      operationTest = OperationBuilder.create('operation1', operationSchema, schemaComponents, {
        staticConfig: {},
        operations: {},
        logger,
        apiDefinitions: []
      });
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
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p =>
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
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p =>
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
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p =>
          p.pipe(
            () => 'next3',
            pp
          )
        );
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });

    test('should allow async functions', async () => {
      const expected = 'next3';
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p => p.pipe(() => Promise.resolve('next3')));
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toStrictEqual(expected);
    });
  });

  describe('operation.run tests', () => {
    let operationTest: Operation;
    beforeEach(() => {
      operationTest = OperationBuilder.create('operation1', operationSchema, schemaComponents, {
        staticConfig: {},
        operations: {},
        logger,
        apiDefinitions: []
      });
    });

    test('should allow a context without req', async () => {
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p => p.push(() => 'good'));

      expect(await operationTest.run({ res: {} })).toStrictEqual('good');
    });

    test('should allow a context without res', async () => {
      operationTest
        .validateResponses(false)
        .validateRequests(false)
        .setup(p => p.push(() => 'good'));

      expect(await operationTest.run({ req: {} })).toStrictEqual('good');
    });
  });
  describe('operation ctx.validateRequest tests', () => {
    let operationTest: Operation;
    beforeEach(() => {
      operationTest = OperationBuilder.create(
        'operation1',
        testSchemaBodyJson['/oauth2/token'].post as OpenAPI.Operation,
        schemaComponents,
        {
          staticConfig: {},
          operations: {},
          logger,
          apiDefinitions: []
        }
      );
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

      const expected = [
        {
          location: 'body',
          message: 'request.body was not present in the request.  Is a body-parser being used?',
          schema: {
            properties: {
              code: {
                description:
                  'The code shall be provided only with grant-type equals authorization_code, and is in that case mandatory',
                type: 'string'
              },
              grant_type: {
                enum: ['password', 'refresh_token', 'authorization_code'],
                type: 'string'
              },
              password: {
                description:
                  "The resource owner password, e.g. the customer's digital account password",
                type: 'string'
              },
              refresh_token: {
                description:
                  'The refresh token most recently acquired via the last call to this service (either with grant type password or refresh)',
                type: 'string'
              },
              username: {
                description:
                  "The resource owner user name, e.g. the customer's digital account login",
                type: 'string'
              }
            },
            required: ['grant_type'],
            type: 'object'
          }
        }
      ];
      const body = null;
      await expect(
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        })
      ).rejects.toThrow(expect.objectContaining({ errors: expected }));
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

      const expected = [
        {
          location: 'body',
          message: 'request.body was not present in the request.  Is a body-parser being used?',
          schema: {
            properties: {
              code: {
                description:
                  'The code shall be provided only with grant-type equals authorization_code, and is in that case mandatory',
                type: 'string'
              },
              grant_type: {
                enum: ['password', 'refresh_token', 'authorization_code'],
                type: 'string'
              },
              password: {
                description:
                  "The resource owner password, e.g. the customer's digital account password",
                type: 'string'
              },
              refresh_token: {
                description:
                  'The refresh token most recently acquired via the last call to this service (either with grant type password or refresh)',
                type: 'string'
              },
              username: {
                description:
                  "The resource owner user name, e.g. the customer's digital account login",
                type: 'string'
              }
            },
            required: ['grant_type'],
            type: 'object'
          }
        }
      ];
      const body = null;

      await expect(
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        })
      ).rejects.toThrow(expect.objectContaining({ errors: expected }));
    });

    test('should validate againts the operation schema', async () => {
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
      const expected = [
        {
          errorCode: 'enum.openapi.validation',
          location: 'body',
          message: 'should be equal to one of the allowed values',
          path: 'grant_type'
        }
      ];
      const body = {
        grant_type: 'not valid',
        username: 'user',
        password: 'pass'
      };

      await expect(operationTest.run({ req: { body }, res: {} })).rejects.toThrow(
        expect.objectContaining({ errors: expected })
      );
    });

    test('should allow a valid schema', async () => {
      operationTest
        .validateResponses(false)
        .setup(p =>
          p
            .push((_, ctx) => ctx.validateRequest())
            .push(() => [{ id: 1, name: '2' }, { id: 3, name: '2' }])
        );

      const expected = [{ id: 1, name: '2' }, { id: 3, name: '2' }];
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      expect(await operationTest.run({ req: { body }, res: {} })).toStrictEqual(expected);
    });

    test('should use default OperatorFunction if setup is not done', async () => {
      operationTest.validateResponses(false);
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
    beforeEach(() => {
      operationTest = OperationBuilder.create(
        'operation1',
        testSchemaBodyJson['/oauth2/token'].post as OpenAPI.Operation,
        schemaComponents,
        {
          staticConfig: {},
          operations: {},
          logger,
          apiDefinitions: []
        }
      );
    });

    test('should validate an not valid response', async () => {
      operationTest.validateRequests(false);
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
          .push((response, ctx) => ctx.validateResponse(response))
      );

      const expected = [
        {
          errorCode: 'required.openapi.responseValidation',
          message: "should have required property 'id'",
          path: 'response[0]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "should have required property 'name'",
          path: 'response[0]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "should have required property 'id'",
          path: 'response[1]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "should have required property 'name'",
          path: 'response[1]'
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
    test('should validate the response by default', async () => {
      operationTest.validateRequests(false);
      operationTest.setup(p =>
        p.push(() => [
          {
            code: 'boo'
          },
          {
            code: 'foo'
          }
        ])
      );

      const expected = [
        {
          errorCode: 'required.openapi.responseValidation',
          message: "should have required property 'id'",
          path: 'response[0]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "should have required property 'name'",
          path: 'response[0]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "should have required property 'id'",
          path: 'response[1]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "should have required property 'name'",
          path: 'response[1]'
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
      ).rejects.toThrow(
        expect.objectContaining({
          errors: expected,
          response: [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        })
      );
    });

    test('should validate an valid response', async () => {
      operationTest.validateRequests(false);
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
        req: { body, headers: { 'content-type': 'application/json' } },
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
  });
});