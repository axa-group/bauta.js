/*
 * Copyright (c) 2018 AXA Shared Services Spain S.A.
 *
 * Licensed under the MyAXA inner-source License (the "License");
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
/* global expect, describe, test, beforeEach, jest */
const Operation = require('../../lib/core/Operation');
const Step = require('../../lib/core/Step');
const Fork = require('../../lib/core/Fork');

const { testService } = require('../fixtures/test-datasource.json');
const [testApiDefinition] = require('../fixtures/test-api-definitions.json');
const testDataource = require('../fixtures/test-datasource.json');

describe('Operation class tests', () => {
  describe('constructor tests', () => {
    test('operation steps should be empty, for undefined loaders', () => {
      const loaderUndefined = undefined;
      const operationTest = new Operation(
        'operation1',
        loaderUndefined,
        testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual([]);
    });

    test('operation steps should be empty, for empty loaders', () => {
      const operationTest = new Operation(
        'operation1',
        [],
        testService.operations[0],
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
        testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual(
        steps.map((s, i) => new Step(s, i === 0 ? 'loader' : 'next'))
      );
    });
  });

  describe('Build operations cases', () => {
    test('should let you build an operation without schema', () => {
      const loaderUndefined = undefined;
      const operationTest = new Operation(
        'operation1',
        loaderUndefined,
        testService.operations[0],
        null,
        'testService'
      );

      expect(operationTest.steps).toEqual([]);
    });

    test('should add the steps if are instance of Step', () => {
      const steps = [new Step(() => 'bender1', 'loader'), new Step(() => 'bender2', 'next')];
      const operationTest = new Operation(
        'operation1',
        steps,
        testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual(steps);
    });

    test('should not add the steps if the given steps are instances of Steps and other types', () => {
      const steps = ['String', new Step(() => 'bender2', 'next')];
      const operationTest = new Operation(
        'operation1',
        steps,
        testService.operations[0],
        testApiDefinition,
        'testService'
      );

      expect(operationTest.steps).toEqual([]);
    });

    test('should build the request validator from the schema parameters', () => {
      const loaderUndefined = () => 'Someloader';
      const operationTest = new Operation(
        'operation1',
        [loaderUndefined],
        testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const req = {
        query: {
          limit: 'string'
        }
      };
      const expected = Object.assign(new Error('limit should be integer'), {
        errors: [
          {
            errorCode: 'type.openapi.validation',
            location: 'query',
            message: 'should be integer',
            path: 'limit'
          }
        ]
      });

      expect(operationTest.validateRequest(req)).toEqual(expected);
    });

    test('should build the response validator from the schema response', () => {
      const loaderUndefined = () => 'Someloader';
      const operationTest = new Operation(
        'operation1',
        [loaderUndefined],
        testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const response = {
        prop: 1
      };
      const expected = {
        errors: [
          {
            errorCode: '$ref.openapi.responseValidation',
            message: "response can't resolve reference #/components/schemas/Pets"
          }
        ],
        message: 'The response was not valid.'
      };
      expect(operationTest.validateResponse(response)).toEqual(expected);
    });

    test('should convert the datasource in a compilable datasource by the request parameter', () => {
      const loaderUndefined = () => 'Someloader';
      const operationSource = testDataource.testService.operations[0];
      const operationTest = new Operation(
        'operation1',
        [loaderUndefined],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      expect(operationTest.dataSource.template.url).toEqual(operationSource.url);
      expect(typeof operationTest.dataSource).toBe('function');
    });

    test('should compile the datasource on call the datasource compile function', () => {
      const loaderUndefined = () => 'Someloader';
      const operationTest = new Operation(
        'operation1',
        [loaderUndefined],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      const compiled = operationTest.dataSource({ variableOption: 'test' });
      expect(compiled.someVariableOption).toEqual('test');
    });

    test('the default error handler should be a promise reject of the given error', async () => {
      const loaderUndefined = () => 'Someloader';
      const operationTest = new Operation(
        'operation1',
        [loaderUndefined],
        testDataource.testService.operations[0],
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

  describe('Operation.setLoader tests', () => {
    test('Should throw an error if the given loader is undefined', () => {
      const operationTest = new Operation(
        'operation1',
        [],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const operationThrow = () => operationTest.setLoader(undefined);
      expect(operationThrow).toThrowError(
        'An step loader can not be undefined on testService.v1.operation1'
      );
    });
    test('the loader should be the first step', () => {
      const operationTest = new Operation(
        'operation1',
        [],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      operationTest.setLoader('loader');

      expect(operationTest.steps[0]).toEqual(new Step('loader', 'loader'));
    });

    test('the operation steps should keep the order', () => {
      const steps = [() => ({ name: 'loader' }), 'next1', () => 'next2'];
      const operationTest = new Operation(
        'operation1',
        steps,
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      operationTest.setLoader('new loader');

      expect(operationTest.steps).toEqual([
        new Step('new loader', 'loader'),
        ...steps.slice(1, steps.length).map(s => new Step(s, 'next'))
      ]);
    });

    test('the operation steps should inherit from the older operation version', () => {
      const steps = [() => ({ name: 'loader' }), 'next1', () => 'next2'];
      const operationTest = new Operation(
        'operation1',
        steps,
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );

      operationTest.setLoader('new loader');

      const opertionV2 = Object.create(operationTest, {});
      opertionV2.setLoader('loader v2');

      expect(opertionV2.steps).toEqual([
        new Step('loader v2', 'loader'),
        ...steps.slice(1, steps.length).map(s => new Step(s, 'next'))
      ]);
    });
  });

  describe('Operation.next tests', () => {
    let operationTest;
    const steps = [() => ({ name: 'loader' }), 'next1', () => 'next2'];

    beforeEach(() => {
      operationTest = new Operation(
        'operation1',
        steps,
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
    });

    test('Should throw an error if the given loader is undefined', () => {
      const operationThrow = () => operationTest.next(undefined);
      expect(operationThrow).toThrow(
        new Error('An step loader can not be undefined on testService.v1.operation1')
      );
    });
    test('the next step should be the last step', () => {
      operationTest.next('next3');

      expect(operationTest.steps[operationTest.steps.length - 1]).toEqual(
        new Step('next3', 'next')
      );
    });

    test('the operation steps should keep the order', () => {
      operationTest.next('next3');

      expect(operationTest.steps).toEqual([
        ...steps.map((s, i) => new Step(s, i === 0 ? 'loader' : 'next')),
        new Step('next3', 'next')
      ]);
    });
  });

  describe('Operation.previous tests', () => {
    let operationTest;
    const steps = [() => ({ name: 'loader' }), 'next1', () => 'next2'];

    beforeEach(() => {
      operationTest = new Operation(
        'operation1',
        steps,
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
    });

    test('Should throw an error if the given loader is undefined', () => {
      const operationThrow = () => operationTest.previous(undefined);
      expect(operationThrow).toThrow(
        new Error('An step loader can not be undefined on testService.v1.operation1')
      );
    });
    test("the previous step should be the the loader's step before", () => {
      operationTest.previous('previous');

      expect(operationTest.steps[0]).toEqual(new Step('previous', 'previous'));
    });

    test('the operation steps should keep the order', () => {
      operationTest.previous('previous');

      expect(operationTest.steps).toEqual([
        new Step('previous', 'previous'),
        ...steps.map((s, i) => new Step(s, i === 0 ? 'loader' : 'next'))
      ]);
    });
  });

  describe('Operation.fork tests', () => {
    let operationTest;
    const steps = [() => ({ name: 'loader' }), 'next1', () => 'next2'];

    beforeEach(() => {
      operationTest = new Operation(
        'operation1',
        steps,
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
    });

    test('the fork step should be the last step', () => {
      operationTest.fork([]);

      expect(operationTest.steps[operationTest.steps.length - 1]).toEqual(new Fork([], 'fork'));
    });

    test('the operation steps should keep the order', () => {
      operationTest.fork([]);

      expect(operationTest.steps).toEqual([
        ...steps.map((s, i) => new Step(s, i === 0 ? 'loader' : 'next')),
        new Fork([], 'fork')
      ]);
    });

    test('the fork step should be executed in parallel and give the result without join', async () => {
      operationTest.fork([1, 2]);
      operationTest.next(v => v);

      const result = await operationTest.exec({});
      const expected = [2, 1];

      expect(result).toEqual(expected);
    });
  });

  describe('Operation.addMiddleware tests', () => {
    let operationTest;
    const steps = ['previous1', () => ({ name: 'loader' }), 'next1', () => 'next2'];

    beforeEach(() => {
      operationTest = new Operation(
        'operation1',
        steps,
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
    });

    test('Should throw an error if the given loader is undefined', () => {
      const operationThrow = () => operationTest.addMiddleware(undefined);
      expect(operationThrow).toThrow(
        new Error('An step loader can not be undefined on testService.v1.operation1')
      );
    });
    test("the middleware step should be the previous hook's step before", () => {
      operationTest.addMiddleware('middleware1');

      expect(operationTest.steps[0]).toEqual(new Step('middleware1', 'middleware'));
    });

    test('the operation steps should keep the order', () => {
      operationTest.addMiddleware('middleware1');

      expect(operationTest.steps).toEqual([
        new Step('middleware1', 'middleware'),
        ...steps.map((s, i) => new Step(s, i === 0 ? 'loader' : 'next'))
      ]);
    });

    test('the middleware should be added in order as the first steps', () => {
      operationTest.addMiddleware('middleware1');
      operationTest.addMiddleware('middleware2');

      expect(operationTest.steps).toEqual([
        new Step('middleware1', 'middleware'),
        new Step('middleware2', 'middleware'),
        ...steps.map((s, i) => new Step(s, i === 0 ? 'loader' : 'next'))
      ]);
    });

    test('the middleware should be added in order as the first steps, in front of previous steps', () => {
      operationTest.previous('previous');
      operationTest.addMiddleware('middleware1');
      operationTest.addMiddleware('middleware2');

      expect(operationTest.steps).toEqual([
        new Step('middleware1', 'middleware'),
        new Step('middleware2', 'middleware'),
        new Step('previous', 'previous'),
        ...steps.map((s, i) => new Step(s, i === 0 ? 'loader' : 'next'))
      ]);
    });

    test('the middleware should be added in order as the first steps, in front of previous steps even if previous steps are added after middlewares', () => {
      operationTest.addMiddleware('middleware1');
      operationTest.addMiddleware('middleware2');
      operationTest.previous('previous');

      expect(operationTest.steps).toEqual([
        new Step('middleware1', 'middleware'),
        new Step('middleware2', 'middleware'),
        new Step('previous', 'previous'),
        ...steps.map((s, i) => new Step(s, i === 0 ? 'loader' : 'next'))
      ]);
    });
  });

  describe('Operation.join tests', () => {
    let operationTest;
    const steps = [() => ({ name: 'loader' })];
    const nextStep = value => value;

    beforeEach(() => {
      operationTest = new Operation(
        'operation1',
        steps,
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      operationTest.fork([5, 6]);
    });

    test('should throw an error if there is a join as an before step', () => {
      operationTest.next(nextStep);
      operationTest.join();
      const expected = new Error(
        'The join step should be used after a fork step. Ex: fork -> next -> join'
      );

      expect(() => operationTest.join()).toThrow(expected);
    });

    test('should throw an error if there is not a fork step as a previous step', () => {
      operationTest.steps.pop();
      operationTest.join();
      const expected = new Error(
        'The join step should be used after a fork step. Ex: fork -> next -> join'
      );

      expect(() => operationTest.join()).toThrow(expected);
    });

    test('should throw an error if there is a fork step followed by a join step', () => {
      const expected = new Error(
        `The join step can't be next to a fork step, please add steps in between. Ex: fork -> next -> join`
      );

      expect(() => operationTest.join()).toThrow(expected);
    });

    test('the join should join a fork execution', async () => {
      operationTest.next(nextStep);
      operationTest.join();

      expect(operationTest.steps).toEqual([
        new Step(steps[0], 'loader'),
        new Fork([5, 6]),
        new Step(nextStep, 'next'),
        operationTest.steps[operationTest.steps.length - 1]
      ]);
      const result = await operationTest.exec({});
      expect(result).toEqual([6, 5]);
    });
  });

  describe('Operation.setErrorHandler tests', () => {
    test('should throw an error if the first argument is not a function', () => {
      const errorHandler = 'String';
      const loaderUndefined = null;
      const operationTest = new Operation(
        'operation1',
        [loaderUndefined],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = new Error(
        `The errorHandler must be a function, instead an ${typeof errorHandler} was found`
      );

      expect(() => operationTest.setErrorHandler(errorHandler)).toThrow(expected);
    });

    test('should set the given error handler', async () => {
      const errorHandler = () => 'error';
      const loader = () => Promise.reject(new Error('crashhh!!!'));
      const operationTest = new Operation(
        'operation1',
        [loader],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = 'error';
      operationTest.setErrorHandler(errorHandler);
      try {
        await operationTest.exec({});
      } catch (e) {
        expect(e).toEqual(expected);
      }
    });

    test('should set the error handler to the inherit operation diferent from the first operation', async () => {
      const errorHandler = () => 'error';
      const errorHandlerV2 = () => 'errorV2';
      const loader = () => Promise.reject(new Error('crashhh!!!'));
      const operationTest = new Operation(
        'operation1',
        [loader],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const operationV2 = new Operation(
        'operation2',
        [loader],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      operationTest.nextVersionOperation = operationV2;
      operationTest.setErrorHandler(errorHandler);

      operationV2.setErrorHandler(errorHandlerV2);
      try {
        await operationTest.exec({});
      } catch (e) {
        expect(e).toEqual('error');
      }

      try {
        await operationV2.exec({});
      } catch (e) {
        expect(e).toEqual('errorV2');
      }
    });
  });

  describe('Operation.setSchema tests', () => {
    const testPathSchema = require('../fixtures/test-path-schema.json');

    test('should throw an error if the schema is invalid', () => {
      const invalidSchema = {};
      const loaderUndefined = null;
      const operationTest = new Operation(
        'operation1',
        [loaderUndefined],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = new Error(`Invalid schema, "" should NOT have fewer than 1 properties`);

      expect(() => operationTest.setSchema(invalidSchema)).toThrow(expected);
    });

    test('should set the new operation schema', () => {
      const loaderUndefined = null;
      const operationTest = new Operation(
        'operation1',
        [loaderUndefined],
        testDataource.testService.operations[0],
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
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      operationTest.steps.push(null);
      const expected = null;

      const res = await operationTest.exec({});
      expect(res).toEqual(expected);
    });

    test('should execute an instance of Operation step', async () => {
      const operationTest = new Operation(
        'operation1',
        [() => 'bender'],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      operationTest.steps.push(
        new Operation(
          'operation1',
          [() => 'bender'],
          testDataource.testService.operations[0],
          testApiDefinition,
          'testService'
        )
      );
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
        testDataource.testService.operations[0],
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
          function loader() {
            expect(this.metadata).toEqual({
              operationId: 'operation1',
              serviceId: 'testService'
            });
          }
        ],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      await operationTest.exec({});
    });

    test('should run with a callback step', async () => {
      const operationTest = new Operation(
        'operation1',
        [(val, cb) => cb(null, 'bender')],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = 'bender';

      const res = await operationTest.exec({});

      expect(res).toEqual(expected);
    });

    test('should allow callback rejection', async () => {
      const operationTest = new Operation(
        'operation1',
        [(val, cb) => cb(new Error('bender'))],
        testDataource.testService.operations[0],
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
        [() => Promise.resolve('bender')],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = 'bender';

      const res = await operationTest.exec({});

      expect(res).toEqual(expected);
    });

    test('should run with a simple step', async () => {
      const operationTest = new Operation(
        'operation1',
        ['bender'],
        testDataource.testService.operations[0],
        testApiDefinition,
        'testService'
      );
      const expected = 'bender';

      const res = await operationTest.exec({});

      expect(res).toEqual(expected);
    });

    test('dataSource should be accesible from previous hook', async () => {
      const operationTest = new Operation(
        'operation1',
        ['bender'],
        {
          id: 'operation1',
          url: '1234'
        },
        testApiDefinition,
        'testService'
      );
      operationTest.previous(function pr() {
        expect(this.dataSource.template.url).toEqual('1234');
      });
      await operationTest.exec({});
    });
  });

  describe('Operation.exec with loopback filters', () => {
    test('should apply the loopback filters to a an loader array', async () => {
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
          id: 'operation1',
          applyLoopbackFilters: true
        },
        testApiDefinition,
        'testService'
      );
      const expected = [
        {
          code: 'foo'
        }
      ];
      const context = {
        query: {
          filter: {
            where: {
              code: 'foo'
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should apply the loopback filters to a an loader array and must be the final "step"', async () => {
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
          id: 'operation1',
          applyLoopbackFilters: true
        },
        testApiDefinition,
        'testService'
      );
      operationTest.next(result => result.filter(r => r.code !== 'foo'));

      const expected = [];
      const context = {
        query: {
          filter: {
            where: {
              code: 'foo'
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should not apply the filter if the result is not an array', async () => {
      const operationTest = new Operation(
        'operation1',
        [
          () => ({
            code: 'boo'
          })
        ],
        {
          id: 'operation1',
          applyLoopbackFilters: true
        },
        testApiDefinition,
        'testService'
      );

      const expected = {
        code: 'boo'
      };
      const context = {
        query: {
          filter: {
            where: {
              code: 'foo'
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should not apply the filter if the applyLoopbackFilters flag is equals to false', async () => {
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
          id: 'operation1',
          applyLoopbackFilters: false
        },
        testApiDefinition,
        'testService'
      );

      const expected = [
        {
          code: 'boo'
        },
        {
          code: 'foo'
        }
      ];
      const context = {
        query: {
          filter: {
            where: {
              code: 'foo'
            }
          }
        }
      };

      expect(await operationTest.exec(context)).toEqual(expected);
    });

    test('should not apply the filter if the applyLoopbackFilters flag is not present on the datasource', async () => {
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
          code: 'boo'
        },
        {
          code: 'foo'
        }
      ];
      const context = {
        query: {
          filter: {
            where: {
              code: 'foo'
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
          id: 'operation1',
          validateRequest: true
        },
        testApiDefinition,
        'testService'
      );

      operationTest.setSchema(testApiDefinitionQueryBody);

      const expected = new Error('username should be string');
      const query = { grant_type: 'password', username: 'user', password: 'pass' };
      const body = { grant_type: 'password', username: 123, password: 'pass' };
      const context = {
        query,
        body
      };

      try {
        await operationTest.exec(context);
      } catch (e) {
        expect(e).toEqual(
          Object.assign(expected, {
            status: 400,
            errors: [
              {
                path: 'username',
                errorCode: 'type.openapi.validation',
                message: 'should be string',
                location: 'body'
              }
            ]
          })
        );
      }
    });

    test('should validate the request for mandatory fields', async () => {
      const operationTest = new Operation(
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
          name: 'test',
          validateRequest: true
        },
        {
          id: 'operation1',
          validateRequest: true
        },
        testApiDefinition,
        'testService'
      );

      const expected = new Error('username should be string');
      const query = { username: 'user', password: 'pass' };
      const body = { grant_type: 'password', username: 123, password: 'pass' };
      const context = {
        query,
        body
      };

      try {
        await operationTest.exec(context);
      } catch (e) {
        expect(e).toEqual(
          Object.assign(expected, {
            errorCode: 'type.openapi.validation',
            location: 'body',
            path: 'username',
            statusCode: 400
          })
        );
      }
    });

    test('should no validate the request if the validateRequest flag is set to false', async () => {
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
          id: 'operation1',
          validateRequest: false
        },
        testApiDefinition,
        'testService'
      );
      operationTest.setSchema(testApiDefinitionQueryBody);

      const expected = [
        {
          code: 'boo'
        },
        {
          code: 'foo'
        }
      ];
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
          id: 'operation1',
          validateRequest: true
        },
        testApiDefinition,
        'testService'
      );
      operationTest.setSchema(testApiDefinitionQueryBody);

      const expected = [
        {
          code: 'boo'
        },
        {
          code: 'foo'
        }
      ];
      const query = { grant_type: 'password', username: 'user', password: 'pass' };
      const body = { grant_type: 'password', username: 'user', password: 'pass' };
      const context = {
        query,
        body
      };
      expect(await operationTest.exec(context)).toEqual(expected);
    });
  });

  describe('Operation.validateRequest tests', () => {
    test('should validate an empty body', () => {
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

      const expected = new Error(
        'request.body was not present in the request.  Is a body-parser being used?'
      );
      const body = null;

      expect(
        operationTest.validateRequest({ body, headers: { 'content-type': 'application/json' } })
      ).toEqual(expected);
    });

    test('should validate againts the operation schema', () => {
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
      const expected = new Error('grant_type should be equal to one of the allowed values');
      const body = { grant_type: 'not valid', username: 'user', password: 'pass' };

      expect(operationTest.validateRequest({ body })).toEqual(expected);
    });

    test('should allow a valid schema', () => {
      const testApiDefinitionBody = require('../fixtures/test-schema-body.json');
      const operationTest = new Operation(
        'operation1',
        [(val, cb) => cb(null, 'bender')],
        {
          id: 'operation1'
        },
        testApiDefinition,
        'testService'
      );
      operationTest.setSchema(testApiDefinitionBody);
      const expected = null;
      const body = { grant_type: 'password', username: 'user', password: 'pass' };

      expect(operationTest.validateRequest({ body })).toEqual(expected);
    });
  });
});
