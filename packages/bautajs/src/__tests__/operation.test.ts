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
import { OperationBuilder } from '../core/operation';
import { logger } from '../index';
import { OpenAPIV3Document, Operation } from '../utils/types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testSchemaBodyJson from './fixtures/test-schema-body.json';

const testDatasource = require('./fixtures/test-datasource');

describe('Operation class tests', () => {
  describe('Build operations cases', () => {
    test('should let you build an operation without schema', () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        { ...(testApiDefinitionsJson[0] as OpenAPIV3Document), paths: {}, components: {} },
        'testService',
        {
          services: {},
          logger,
          apiDefinitions: []
        }
      );

      expect(operationTest).toBeInstanceOf(OperationBuilder);
    });

    test('should build the request validator from the schema parameters', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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

    test('should convert the datasource in a compilable datasource by the request parameter', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
      );

      operationTest.validateResponse(false).setup(p =>
        p.push((_, ctx) => {
          expect(typeof ctx.dataSourceBuilder).toBe('function');
        })
      );

      await operationTest.run({});
    });

    test('should compile the datasource on call the datasource compile function', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        (testApiDefinitionsJson[0] as OpenAPIV3Document) as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
      );

      operationTest.validateResponse(false).setup(p =>
        p.push((_, ctx) => {
          const compiled = ctx.dataSourceBuilder(_);
          expect(compiled.headers && compiled.headers.someVariableOption).toEqual('test');
        })
      );

      await operationTest.run({
        req: {
          variableOption: 'test'
        }
      });
    });

    test('the default error handler should be a promise reject of the given error', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        (testApiDefinitionsJson[0] as OpenAPIV3Document) as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
    let operationTest: Operation;

    beforeEach(() => {
      operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        (testApiDefinitionsJson[0] as OpenAPIV3Document) as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
      )
        .validateResponse(false)
        .validateRequest(false);
      const operationV2 = OperationBuilder.create(
        'operation2',
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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

  describe('Operation.run tests', () => {
    test('should allow a context without req', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
      );

      operationTest
        .validateResponse(false)
        .validateRequest(false)
        .setup(p => p.push(() => 'good'));

      expect(await operationTest.run({ res: {} })).toEqual('good');
    });

    test('should allow a context without res', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
      );
      operationTest
        .validateResponse(false)
        .validateRequest(false)
        .setup(p => p.push(() => 'good'));

      expect(await operationTest.run({ req: {} })).toEqual('good');
    });

    test('should add the metadata operationId and serviceId on the context', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
          runner: () => ({
            url: '1234'
          })
        },
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
      )
        .validateRequest(false)
        .validateResponse(false);

      operationTest.setup(p =>
        p.push((previous, ctx) => {
          expect(ctx.dataSourceBuilder.template.id).toEqual('operation1');
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
        testDatasource.services.testService.operations[0],
        { ...testApiDefinitionsJson[0], paths: testSchemaBodyJson } as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        { ...testApiDefinitionsJson[0], paths: testSchemaBodyJson } as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        { ...testApiDefinitionsJson[0], paths: testSchemaBodyJson } as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        { ...testApiDefinitionsJson[0], paths: testSchemaBodyJson } as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
      );
      operationTest
        .validateResponse(false)
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

      expect(await operationTest.run({ req: { body }, res: {} })).toEqual(expected);
    });

    test('should use default step if setup is not done', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        { ...testApiDefinitionsJson[0], paths: testSchemaBodyJson } as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
      );

      operationTest.validateResponse(false);
      const expected = {
        headers: {
          someVariableOption: undefined
        },
        url: 'https://google.com/'
      };
      const body = {
        grant_type: 'password',
        username: 'user',
        password: 'pass'
      };

      expect(await operationTest.run({ req: { body }, res: {} })).toEqual(expected);
    });
  });

  describe('Operation ctx.validateResponse tests', () => {
    test('should validate an not valid response', async () => {
      const operationTest = OperationBuilder.create(
        'operation1',
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
        testDatasource.services.testService.operations[0],
        testApiDefinitionsJson[0] as OpenAPIV3Document,
        'testService',
        { services: {}, logger, apiDefinitions: [] }
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
