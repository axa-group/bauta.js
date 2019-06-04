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
/* global expect, describe, test, beforeEach, jest */
import nock from 'nock';
import { OperationBuilder } from '../core/operation';
import { LoggerBuilder } from '../logger';
import { Context, Metadata, OpenAPIV3Document, Operation } from '../utils/types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testDatasourceJson from './fixtures/test-datasource.json';
import testPathSchemaJson from './fixtures/test-path-schema.json';
import testSchemaBodyJson from './fixtures/test-schema-body.json';

describe('Operation class tests', () => {
  describe('Build operations cases', () => {
    test('should let you build an operation without schema', () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        { ...(testApiDefinitionsJson[0] as OpenAPIV3Document), paths: {}, components: {} },
        'testService'
      );

      expect(operationTest).toBeInstanceOf(OperationBuilder);
    });

    test('should build the request validator from the schema parameters', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
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
      try {
        await operationTest.run(ctx);
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should build the response validator from the schema response', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      const req = {
        prop: 1
      };
      const res = {};
      const expected = [
        {
          errorCode: 'type.openapi.responseValidation',
          message: 'response should be array'
        }
      ];
      const ctx = { req, res };
      operationTest.setup(p => p.push(() => 1));
      try {
        await operationTest.run(ctx);
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should convert the datasource in a compilable datasource by the request parameter', () => {
      const operationSource = testDatasourceJson.services.testService.operations[0];
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      expect(operationTest.dataSource.template.url).toEqual(operationSource.url);
      expect(typeof operationTest.dataSource).toBe('function');
    });

    test('should compile the datasource on call the datasource compile function', () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        (testApiDefinitionsJson[0] as OpenAPIV3Document) as OpenAPIV3Document,
        'testService'
      );
      const ctx: Context<{}, {}> = {
        dataSource: operationTest.dataSource,
        validateRequest: (request: any = ctx.req) => request,
        validateResponse: (response: any) => response,
        metadata: {} as Metadata,
        req: {
          variableOption: 'test'
        },
        res: {},
        data: {},
        url: testDatasourceJson.services.testService.operations[0].url,
        logger: new LoggerBuilder('test')
      };
      const compiled = ctx.dataSource();
      expect(
        compiled.options && compiled.options.headers && compiled.options.headers.someVariableOption
      ).toEqual('test');
    });

    test('the default error handler should be a promise reject of the given error', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        (testApiDefinitionsJson[0] as OpenAPIV3Document) as OpenAPIV3Document,
        'testService'
      );
      const error = new Error('someError');
      const ctx = { req: {}, res: {} };
      operationTest
        .validateResponse(false)
        .validateRequest(false)
        .setup(p =>
          p.push(() => {
            throw new Error('someError');
          })
        );
      try {
        await operationTest.run(ctx);
      } catch (e) {
        expect(e).toEqual(error);
      }
    });
  });

  describe('Operation.setup tests', () => {
    let operationTest: Operation<{}, {}>;

    beforeEach(() => {
      operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        (testApiDefinitionsJson[0] as OpenAPIV3Document) as OpenAPIV3Document,
        'testService'
      );
    });

    test('Should throw an error if the given resolver is undefined', () => {
      // @ts-ignore
      const operationThrow = () => operationTest.setup(p => p.push(undefined));
      expect(operationThrow).toThrow(
        new Error('An step can not be undefined on testService.v1.operation1')
      );
    });
    test('Pushed steps must be executed in order', async () => {
      const expected = 'this will be showed';
      operationTest
        .validateResponse(false)
        .validateRequest(false)
        .setup(p => p.push(() => 'next3').push(() => expected));
      const ctx = { req: {}, res: {} };

      expect(await operationTest.run(ctx)).toEqual(expected);
    });
  });

  describe('Operation.setErrorHandler tests', () => {
    test('should throw an error if the first argument is not a function', () => {
      const errorHandler = 'String';
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      const expected = new Error(
        `The errorHandler must be a function, instead an ${typeof errorHandler} was found`
      );

      // @ts-ignore
      expect(() => operationTest.setErrorHandler(errorHandler)).toThrow(expected);
    });

    test('should set the given error handler', async () => {
      const errorHandler = () => Promise.reject(new Error('error'));
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      const ctx = { req: {}, res: {} };
      const expected = new Error('error');
      operationTest
        .validateResponse(false)
        .validateRequest(false)
        .setErrorHandler(errorHandler)
        .setup(p => p.push(() => Promise.reject(new Error('crashhh!!!'))));
      try {
        await operationTest.run(ctx);
      } catch (e) {
        expect(e).toEqual(expected);
      }
    });

    test('should be called only onces', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('error'));
      const step1 = () => 'bender';
      const step2 = () => 'bender3';
      const step3 = () => Promise.reject(new Error('crashhh!!!'));
      const step4 = () => 'bender4';
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      operationTest
        .setup(p =>
          p
            .push(step1)
            .push(step2)
            .push(step3)
            .push(step4)
        )
        .validateResponse(false)
        .validateRequest(false)
        .setErrorHandler(errorHandler);
      const ctx = { req: {}, res: {} };
      try {
        await operationTest.run(ctx);
      } catch (e) {
        expect(errorHandler.mock.calls.length).toBe(1);
        expect(e).toEqual(new Error('error'));
      }
    });

    test('should set the error handler to the inherit operation diferent from the first operation', async () => {
      const errorHandler = () => Promise.reject(new Error('error'));
      const errorHandlerV2 = () => Promise.reject(new Error('errorV2'));
      const step = () => Promise.reject(new Error('crashhh!!!'));
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      )
        .validateResponse(false)
        .validateRequest(false);
      const operationV2 = OperationBuilder.create(
        'operation2',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      )
        .validateResponse(false)
        .validateRequest(false);

      operationTest.nextVersionOperation = operationV2;
      operationTest.setErrorHandler(errorHandler);

      operationV2.setErrorHandler(errorHandlerV2);
      operationTest.setup(p => p.push(step));
      const ctx = { req: {}, res: {} };

      try {
        await operationTest.run(ctx);
      } catch (e) {
        expect(e).toEqual(new Error('error'));
      }

      try {
        await operationV2.run(ctx);
      } catch (e) {
        expect(e).toEqual(new Error('errorV2'));
      }
    });
  });

  describe('Operation.setSchema tests', () => {
    test('should throw an error if the schema is invalid', () => {
      const invalidSchema = {};
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      const expected = new Error(`Invalid schema, "" should NOT have fewer than 1 properties`);

      expect(() => operationTest.setSchema(invalidSchema)).toThrow(expected);
    });

    test('should set the new operation schema', () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      operationTest.setSchema(testPathSchemaJson);

      expect(operationTest.schema).toEqual(testPathSchemaJson);
      expect(typeof operationTest.validateRequest).toEqual('function');
      expect(typeof operationTest.validateResponse).toEqual('function');
    });
  });

  describe('Operation.run tests', () => {
    test('should throw an error if there is no context req', () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      const expected = new Error('The context(req) parameter is mandatory');

      // @ts-ignore
      expect(() => operationTest.run({ res: {} })).toThrow(expected);
    });

    test('should throw an error if there is no context res', () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      const expected = new Error('The context(res) parameter is mandatory');

      // @ts-ignore
      expect(() => operationTest.run({ req: {} })).toThrow(expected);
    });

    test('should add the metadata operationId and serviceId on the context', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      operationTest
        .validateRequest(false)
        .validateResponse(false)
        .setup(p =>
          p.push((_, ctx) => {
            expect(ctx.metadata).toEqual({
              operationId: 'operation1',
              serviceId: 'testService',
              version: 'v1'
            });

            return [{ id: 1, name: '2' }];
          })
        );
      const ctx = { req: {}, res: {} };

      await operationTest.run(ctx);
    });

    test('dataSource should be accesible from all steps', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        {
          id: 'operation1',
          url: '1234'
        },
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      )
        .validateRequest(false)
        .validateResponse(false);

      operationTest.setup(p =>
        p.push((previous, ctx) => {
          expect(ctx.dataSource.template.url).toEqual('1234');
          return previous;
        })
      );
      const ctx = { req: {}, res: {} };
      await operationTest.run(ctx);
    });
  });
  describe('Operation ctx.validateRequest tests', () => {
    test('should validate the request by default', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
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
      operationTest.setSchema(testSchemaBodyJson);

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

      try {
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        });
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should validate an empty body', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
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
      operationTest.setSchema(testSchemaBodyJson);

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

      try {
        operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        });
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should validate againts the operation schema', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
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
      operationTest.setSchema(testSchemaBodyJson);
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

      try {
        await operationTest.run({ req: { body }, res: {} });
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should allow a valid schema', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );
      operationTest
        .validateResponse(false)
        .setup(p =>
          p
            .push((_, ctx) => ctx.validateRequest())
            .push(() => [{ id: 1, name: '2' }, { id: 3, name: '2' }])
        );

      operationTest.setSchema(testSchemaBodyJson);
      const expected = [{ id: 1, name: '2' }, { id: 3, name: '2' }];
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      expect(await operationTest.run({ req: { body }, res: {} })).toEqual(expected);
    });

    test('should use default step if setup is not done', async () => {
      nock('https://google.com')
        .get('/')
        .reply(200, {
          foo: 'boo'
        });

      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      );

      operationTest.setSchema(testSchemaBodyJson).validateResponse(false);
      const expected = {
        foo: 'boo'
      };
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      expect(await operationTest.run({ req: { body }, res: {} })).toEqual(expected);

      nock.cleanAll();
    });
  });

  describe('Operation ctx.validateResponse tests', () => {
    test('should validate an not valid response', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      ).validateRequest(false);
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
          message: "response[0] should have required property 'id'",
          path: 'response[0]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "response[0] should have required property 'name'",
          path: 'response[0]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "response[1] should have required property 'id'",
          path: 'response[1]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "response[1] should have required property 'name'",
          path: 'response[1]'
        }
      ];
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      try {
        await operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        });
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });
    test('should validate the response by default', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      ).validateRequest(false);
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
          message: "response[0] should have required property 'id'",
          path: 'response[0]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "response[0] should have required property 'name'",
          path: 'response[0]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "response[1] should have required property 'id'",
          path: 'response[1]'
        },
        {
          errorCode: 'required.openapi.responseValidation',
          message: "response[1] should have required property 'name'",
          path: 'response[1]'
        }
      ];
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      try {
        await operationTest.run({
          req: { body, headers: { 'content-type': 'application/json' } },
          res: {}
        });
      } catch (e) {
        expect(e.errors).toEqual(expected);
        expect(e.response).toEqual([
          {
            code: 'boo'
          },
          {
            code: 'foo'
          }
        ]);
      }
    });

    test('should validate an valid response', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasourceJson.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService'
      ).validateRequest(false);
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

      expect(result).toEqual(expected);
    });
  });
});
