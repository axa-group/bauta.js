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
const Operation = require('../../core/Operation');
const Step = require('../../core/Step');

const { services } = require('../fixtures/test-datasource.json');
const [testApiDefinition] = require('../fixtures/test-api-definitions.json');
const [testApiDefinitionNoArray] = require('../fixtures/test-api-definitions-no-array.json');
const testDataource = require('../fixtures/test-datasource.json');

describe('Operation class tests', () => {
  describe('constructor tests', () => {
    test('operation steps should be empty, for undefined step', () => {
      const stepUndefined = undefined;
      const operationTest = new Operation(
        'operation1',
        stepUndefined,
        services.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual([]);
    });

    test('operation steps should be empty, for empty step', () => {
      const operationTest = new Operation(
        'operation1',
        [],
        services.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual([]);
    });

    test('operation steps should be built keeping the order', () => {
      const steps = [() => ({ name: 'loader' }), 'next1', () => 'next2'];
      const operationTest = new Operation(
        'operation1',
        steps,
        services.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual(steps.map(s => new Step(s)));
    });
  });

  describe('Build operations cases', () => {
    test('should let you build an operation without schema', () => {
      const stepUndefined = undefined;
      const operationTest = new Operation(
        'operation1',
        stepUndefined,
        services.testService.operations[0],
        null,
        'testService'
      );

      expect(operationTest.steps).toEqual([]);
    });

    test('should add the steps if are instance of Step', () => {
      const steps = [new Step(() => 'bender1'), new Step(() => 'bender2')];
      const operationTest = new Operation(
        'operation1',
        steps,
        services.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual(steps);
    });

    test('should not add the steps if the given steps are instances of Steps and other types', () => {
      const steps = ['String', new Step(() => 'bender2')];
      const operationTest = new Operation(
        'operation1',
        steps,
        services.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual([]);
    });

    test('should build the request validator from the schema parameters', async () => {
      const operationTest = new Operation(
        'operation1',
        [(_, ctx) => ctx.validateRequest()],
        services.testService.operations[0],
        testApiDefinition,
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
      try {
        await operationTest.exec(req, res);
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should build the response validator from the schema response', async () => {
      const operationTest = new Operation(
        'operation1',
        [(_, ctx) => ctx.validateResponse()],
        services.testService.operations[0],
        testApiDefinition,
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

      try {
        await operationTest.exec(req, res);
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should convert the datasource in a compilable datasource by the request parameter', () => {
      const stepUndefined = () => 'Someloader';
      const operationSource = testDataource.services.testService.operations[0];
      const operationTest = new Operation(
        'operation1',
        [stepUndefined],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      expect(operationTest.dataSource.template.url).toEqual(operationSource.url);
      expect(typeof operationTest.dataSource).toBe('function');
    });

    test('should compile the datasource on call the datasource compile function', () => {
      const stepUndefined = () => 'Someloader';
      const operationTest = new Operation(
        'operation1',
        [stepUndefined],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      const compiled = operationTest.dataSource({ req: { variableOption: 'test' } });
      expect(compiled.someVariableOption).toEqual('test');
    });

    test('the default error handler should be a promise reject of the given error', async () => {
      const stepUndefined = () => 'Someloader';
      const operationTest = new Operation(
        'operation1',
        [stepUndefined],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const error = new Error('someError');

      try {
        await operationTest.error.handler(error);
      } catch (e) {
        expect(e).toEqual(error);
      }
    });
  });

  describe('Operation.push tests', () => {
    let operationTest;
    const steps = [() => ({ name: 'loader' }), 'next1', () => 'next2'];

    beforeEach(() => {
      operationTest = new Operation(
        'operation1',
        steps,
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
    });

    test('Should throw an error if the given step is undefined', () => {
      const operationThrow = () => operationTest.push(undefined);
      expect(operationThrow).toThrow(
        new Error('An step can not be undefined on testService.v1.operation1')
      );
    });
    test('the next pushed step should be the last step', () => {
      operationTest.push('next3');

      expect(operationTest.steps[operationTest.steps.length - 1]).toEqual(new Step('next3'));
    });
  });

  describe('Operation.setErrorHandler tests', () => {
    test('should throw an error if the first argument is not a function', () => {
      const errorHandler = 'String';
      const stepUndefined = null;
      const operationTest = new Operation(
        'operation1',
        [stepUndefined],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = new Error(
        `The errorHandler must be a function, instead an ${typeof errorHandler} was found`
      );

      expect(() => operationTest.setErrorHandler(errorHandler)).toThrow(expected);
    });

    test('should set the given error handler', async () => {
      const errorHandler = () => Promise.reject(new Error('error'));
      const step = () => Promise.reject(new Error('crashhh!!!'));
      const operationTest = new Operation(
        'operation1',
        [step],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = new Error('error');
      operationTest.setErrorHandler(errorHandler);
      try {
        await operationTest.exec({});
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
      const operationTest = new Operation(
        'operation1',
        [step1, step2, step3, step4],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      operationTest.setErrorHandler(errorHandler);
      try {
        await operationTest.exec({});
      } catch (e) {
        expect(errorHandler.mock.calls.length).toBe(1);
        expect(e).toEqual(new Error('error'));
      }
    });

    test('should set the error handler to the inherit operation diferent from the first operation', async () => {
      const errorHandler = () => Promise.reject(new Error('error'));
      const errorHandlerV2 = () => Promise.reject(new Error('errorV2'));
      const step = () => Promise.reject(new Error('crashhh!!!'));
      const operationTest = new Operation(
        'operation1',
        [step],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const operationV2 = new Operation(
        'operation2',
        [step],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      operationTest.nextVersionOperation = operationV2;
      operationTest.setErrorHandler(errorHandler);

      operationV2.setErrorHandler(errorHandlerV2);
      try {
        await operationTest.exec({});
      } catch (e) {
        expect(e).toEqual(new Error('error'));
      }

      try {
        await operationV2.exec({});
      } catch (e) {
        expect(e).toEqual(new Error('errorV2'));
      }
    });
  });

  describe('Operation.setSchema tests', () => {
    const testPathSchema = require('../fixtures/test-path-schema.json');

    test('should throw an error if the schema is invalid', () => {
      const invalidSchema = {};
      const stepUndefined = null;
      const operationTest = new Operation(
        'operation1',
        [stepUndefined],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = new Error(`Invalid schema, "" should NOT have fewer than 1 properties`);

      expect(() => operationTest.setSchema(invalidSchema)).toThrow(expected);
    });

    test('should set the new operation schema', () => {
      const stepUndefined = null;
      const operationTest = new Operation(
        'operation1',
        [stepUndefined],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      operationTest.setSchema(testPathSchema);

      expect(operationTest.schema).toEqual(testPathSchema);
      expect(typeof operationTest.validateRequest).toEqual('function');
      expect(typeof operationTest.validateResponse).toEqual('function');
    });
  });

  describe('Operation.run tests', () => {
    test('should not crash for undefined or null step', async () => {
      const operationTest = new Operation(
        'operation1',
        [() => 'bender'],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      operationTest.steps.push(null);
      const expected = 'bender';

      const res = await operationTest.exec({});
      expect(res).toEqual(expected);
    });
  });

  describe('Operation.exec tests', () => {
    test('should throw an error if there is no context', () => {
      const operationTest = new Operation(
        'operation1',
        [() => 'bender'],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = new Error('The context(req) parameter is mandatory');

      expect(() => operationTest.exec()).toThrow(expected);
    });

    test('should add the metadata operationId and serviceId on the context', async () => {
      const operationTest = new Operation(
        'operation1',
        [
          function step(_, ctx) {
            expect(ctx.metadata).toEqual({
              operationId: 'operation1',
              serviceId: 'testService'
            });

            return [{ id: 1, name: '2' }];
          }
        ],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      await operationTest.exec({});
    });

    test('should run with a callback step', async () => {
      const operationTest = new Operation(
        'operation1',
        [(val, ctx, cb) => cb(null, [{ id: 1, name: '2' }])],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = [{ id: 1, name: '2' }];

      const res = await operationTest.exec({});

      expect(res).toEqual(expected);
    });

    test('should allow callback rejection', async () => {
      const operationTest = new Operation(
        'operation1',
        [(val, ctx, cb) => cb(new Error('bender'))],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = new Error('bender');

      try {
        await operationTest.exec({});
      } catch (e) {
        expect(e).toEqual(expected);
      }
    });

    test('should run with a promise step', async () => {
      const operationTest = new Operation(
        'operation1',
        [() => Promise.resolve([{ id: 1, name: '2' }])],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = [{ id: 1, name: '2' }];

      const res = await operationTest.exec({});

      expect(res).toEqual(expected);
    });

    test('should run with a simple step', async () => {
      const operationTest = new Operation(
        'operation1',
        [[{ id: 1, name: '2' }]],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = [{ id: 1, name: '2' }];

      const res = await operationTest.exec({});

      expect(res).toEqual(expected);
    });

    test('dataSource should be accesible from all steps', async () => {
      const operationTest = new Operation(
        'operation1',
        [[{ id: 1, name: '2' }]],
        {
          id: 'operation1',
          url: '1234'
        },
        testApiDefinition,
        'testService'
      );
      operationTest.push((previous, ctx) => {
        expect(ctx.dataSource.template.url).toEqual('1234');
        return previous;
      });
      await operationTest.exec({});
    });
  });

  describe('Operation.exec stop chain with res.end', () => {
    test('should stop the chain with an res.end', async () => {
      const operationTest = new Operation(
        'operation1',
        [
          () => 'bender',
          (_, ctx) => {
            ctx.res.end('end request');
          },
          (_, ctx) => {
            ctx.res.end('this wont be executed');
          }
        ],
        testDataource.services.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const req = {};
      const res = {
        end(result) {
          this.finished = true;
          this.result = result;
        }
      };

      await operationTest.exec(req, res);

      expect(res.result).toEqual('end request');
    });
  });

  describe('Operation.exec with loopback filters', () => {
    test('should apply the loopback filters to a an step array', async () => {
      const operationTest = new Operation(
        'operation1',
        [() => [{ id: 1, name: '2' }, { name: 'ad', id: 2 }]],
        {
          id: 'operation1',
          applyLoopbackFilters: true
        },
        testApiDefinition,
        'testService'
      );
      const expected = [{ name: 'ad', id: 2 }];
      const context = {
        query: {
          filter: {
            where: {
              id: 2
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should apply the loopback filters to a an step array and must be the final "step"', async () => {
      const operationTest = new Operation(
        'operation1',
        [[{ id: 1, name: '2' }, { name: 'ad', id: 2 }]],
        {
          id: 'operation1',
          applyLoopbackFilters: true
        },
        testApiDefinition,
        'testService'
      );
      operationTest.push(result => result.filter(r => r.id !== 2));

      const expected = [];
      const context = {
        query: {
          filter: {
            where: {
              id: 2
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should not apply the filter if the result is not an array', async () => {
      const operationTest = new Operation(
        'operation1',
        [() => ({ id: 1, name: '2' })],
        {
          id: 'operation1',
          applyLoopbackFilters: true
        },
        testApiDefinitionNoArray,
        'testService'
      );

      const expected = { id: 1, name: '2' };
      const context = {
        query: {
          filter: {
            where: {
              id: 2
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should not apply the filter if the applyLoopbackFilters flag is equals to false', async () => {
      const operationTest = new Operation(
        'operation1',
        [() => [{ id: 1, name: '2' }, { id: 3, name: '2' }]],
        {
          id: 'operation1',
          applyLoopbackFilters: false
        },
        testApiDefinition,
        'testService'
      );

      const expected = [{ id: 1, name: '2' }, { id: 3, name: '2' }];
      const context = {
        query: {
          filter: {
            where: {
              id: 1
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should not apply the filter if the applyLoopbackFilters flag is not present on the datasource', async () => {
      const operationTest = new Operation(
        'operation1',
        [() => [{ id: 1, name: '2' }, { id: 3, name: '2' }]],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
      );

      const expected = [{ id: 1, name: '2' }, { id: 3, name: '2' }];
      const context = {
        query: {
          filter: {
            where: {
              id: 1
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should validate the request if there is the validateRequest flag to true on the datasource', async () => {
      const testApiDefinitionQueryBody = require('../fixtures/test-schema-query-body.json');
      const operationTest = new Operation(
        'operation1',
        [
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ],
        {
          id: 'operation1'
        },
        {
          ...testApiDefinition,
          validateRequest: true
        },
        'testService'
      );

      operationTest.setSchema(testApiDefinitionQueryBody);

      const query = { grant_type: 'password', username: 'user', password: 'pass' };
      const body = { grant_type: 'password', username: 123, password: 'pass' };
      const context = {
        query,
        body
      };

      try {
        await operationTest.exec(context);
      } catch (e) {
        expect(e.errors).toEqual([
          {
            errorCode: 'type.openapi.validation',
            location: 'body',
            message: 'should be string',
            path: 'username'
          }
        ]);
      }
    });

    test('should validate the request for mandatory fields', async () => {
      const operationTest = new Operation(
        'operation1',
        [
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ],
        {
          id: 'operation1'
        },
        { ...testApiDefinition, validateRequest: true },
        'testService'
      );

      const query = { username: 'user', password: 'pass' };
      const body = { grant_type: 'password', username: 123, password: 'pass' };
      const context = {
        query,
        body
      };

      try {
        await operationTest.exec(context);
      } catch (e) {
        expect(e.errors).toEqual([
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
        ]);
      }
    });

    test('should no validate the request if the validateRequest flag is set to false', async () => {
      const testApiDefinitionQueryBody = require('../fixtures/test-schema-query-body.json');
      const operationTest = new Operation(
        'operation1',
        [() => [{ id: 1, name: '2' }, { id: 3, name: '2' }]],
        {
          id: 'operation1'
        },
        {
          ...testApiDefinition,
          validateRequest: false
        },
        'testService'
      );
      operationTest.setSchema(testApiDefinitionQueryBody);

      const expected = [{ id: 1, name: '2' }, { id: 3, name: '2' }];
      const query = { grant_type: 'password', username: 'user', password: 'pass' };
      const body = { grant_type: 'password', username: 123, password: 'pass' };
      const context = {
        query,
        body
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should validate the request if there is the validateRequest flag to true on the datasource and pass the validation if all is okey', async () => {
      const testApiDefinitionQueryBody = require('../fixtures/test-schema-query-body.json');
      const operationTest = new Operation(
        'operation1',
        [() => [{ id: 1, name: '2' }, { id: 3, name: '2' }]],
        {
          id: 'operation1'
        },
        {
          ...testApiDefinition,
          validateRequest: true
        },
        'testService'
      );
      operationTest.setSchema(testApiDefinitionQueryBody);

      const expected = [{ id: 1, name: '2' }, { id: 3, name: '2' }];
      const query = { grant_type: 'password', username: 'user', password: 'pass' };
      const body = { grant_type: 'password', username: 'user', password: 'pass' };
      const context = {
        query,
        body
      };
      expect(await operationTest.exec(context)).toEqual(expected);
    });
  });

  describe('Operation ctx.validateRequest tests', () => {
    test('should validate the request by default', async () => {
      const testApiDefinitionBody = require('../fixtures/test-schema-body.json');

      const operationTest = new Operation(
        'operation1',
        [
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
      );
      operationTest.setSchema(testApiDefinitionBody);

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
        operationTest.exec({ body, headers: { 'content-type': 'application/json' } }, {});
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should validate an empty body', async () => {
      const testApiDefinitionBody = require('../fixtures/test-schema-body.json');

      const operationTest = new Operation(
        'operation1',
        [
          (_, ctx) => ctx.validateRequest(),
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
      );
      operationTest.setSchema(testApiDefinitionBody);

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
        operationTest.exec({ body, headers: { 'content-type': 'application/json' } }, {});
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should validate againts the operation schema', async () => {
      const testApiDefinitionBody = require('../fixtures/test-schema-body.json');

      const operationTest = new Operation(
        'operation1',
        [
          (_, ctx) => ctx.validateRequest(),
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
      );
      operationTest.setSchema(testApiDefinitionBody);
      const expected = [
        {
          errorCode: 'enum.openapi.validation',
          location: 'body',
          message: 'should be equal to one of the allowed values',
          path: 'grant_type'
        }
      ];
      const body = { grant_type: 'not valid', username: 'user', password: 'pass' };

      try {
        await operationTest.exec({ body }, {});
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });

    test('should allow a valid schema', async () => {
      const testApiDefinitionBody = require('../fixtures/test-schema-body.json');
      const operationTest = new Operation(
        'operation1',
        [
          (_, ctx) => ctx.validateRequest(),
          (val, ctx, cb) => cb(null, [{ id: 1, name: '2' }, { id: 3, name: '2' }])
        ],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
      );
      operationTest.setSchema(testApiDefinitionBody);
      const expected = [{ id: 1, name: '2' }, { id: 3, name: '2' }];
      const body = { grant_type: 'password', username: 'user', password: 'pass' };

      expect(await operationTest.exec({ body }, {})).toEqual(expected);
    });
  });

  describe('Operation ctx.validateResponse tests', () => {
    test('should validate an not valid response', async () => {
      const operationTest = new Operation(
        'operation1',
        [
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ],
          (response, ctx) => ctx.validateResponse(response)
        ],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
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
      const body = { grant_type: 'password', username: 'user', password: 'pass' };

      try {
        await operationTest.exec({ body, headers: { 'content-type': 'application/json' } }, {});
      } catch (e) {
        expect(e.errors).toEqual(expected);
      }
    });
    test('should validate the response by default', async () => {
      const operationTest = new Operation(
        'operation1',
        [
          () => [
            {
              code: 'boo'
            },
            {
              code: 'foo'
            }
          ]
        ],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
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
      const body = { grant_type: 'password', username: 'user', password: 'pass' };

      try {
        await operationTest.exec({ body, headers: { 'content-type': 'application/json' } }, {});
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
      const operationTest = new Operation(
        'operation1',
        [
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
            ctx.validateResponse(response);

            return response;
          }
        ],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
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
      const result = await operationTest.exec(
        { headers: { 'content-type': 'application/json' } },
        {}
      );

      expect(result).toEqual(expected);
    });
  });
});
