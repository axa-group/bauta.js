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
import fastSafeStringify from 'fast-safe-stringify';
import path from 'path';
import { BautaJS, pipe, resolver, OnCancel, Document, CancelablePromise } from '../index';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testApiDefinitions2VersionsJson from './fixtures/test-api-definition-2-versions.json';

describe('bauta core tests', () => {
  describe('core initialization tests', () => {
    test('should initialize the core with the given parameters', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        },
        resolvers: [
          operations => {
            operations.operation1.setup(() => 'ok');
          }
        ]
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1).toBeDefined();
    });

    test('should throw an error for a not valid testApi definition', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(
        () =>
          new BautaJS<{
            req: any;
            res: { statusCode: number; headersSent: boolean; finished: boolean };
          }>({
            // @ts-ignore
            apiDefinition: {},
            staticConfig: config
          })
      ).toThrow(
        'The OpenAPI API definition provided is not valid. Error Cannot convert undefined or null to object'
      );
    });

    test('should initialize without api definition', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        },
        resolvers: [
          operations => {
            operations.operation1.setup(() => 'ok');
          }
        ]
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1).toBeDefined();
    });
    test('after bootstrap should not be possible to create new operations', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        },
        resolvers: [
          operations => {
            operations.operation1.setup(() => 'ok');
          }
        ]
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1).toBeDefined();
      expect(bautaJS.operations.operation2).not.toBeDefined();
    });
  });

  describe('validate request globally', () => {
    test('should validate the request by ./fixtures', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });

      await bautaJS.bootstrap();

      await expect(() => bautaJS.operations.operation1.run({ req, res })).toThrow(
        expect.objectContaining({
          message: 'The request was not valid',
          errors: [
            {
              path: '.limit',
              location: 'query',
              message: 'should be integer',
              errorCode: 'type'
            }
          ]
        })
      );
    });

    test('should not validate the request if validateRequest is set to false globally', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        enableRequestValidation: false,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();

      expect(await bautaJS.operations.operation1.run({ req, res })).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should priorize the local operation toggle over the global one', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        enableRequestValidation: false,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      bautaJS.operations.operation1.validateRequest(true);
      await bautaJS.bootstrap();

      await expect(() => bautaJS.operations.operation1.run({ req, res })).toThrow(
        expect.objectContaining({
          message: 'The request was not valid',
          errors: [
            {
              path: '.limit',
              location: 'query',
              message: 'should be integer',
              errorCode: 'type'
            }
          ]
        })
      );
    });
  });

  describe('validate response globally', () => {
    test('should format the validation error to string', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 123
        }
      };
      const res = {};

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });

      bautaJS.operations.operation1.validateResponse(true).setup(() => [{ id: '22' }]);

      await bautaJS.bootstrap();

      expect.assertions(1);
      try {
        await bautaJS.operations.operation1.run({ req, res });
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e.stack).toStrictEqual(
          `${e.name}: ${e.message} \n ${fastSafeStringify(e, undefined, 2)}`
        );
      }
    });

    test('should not validate the response by default', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 123
        }
      };
      const res = {};

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      bautaJS.operations.operation1.setup(() => ({
        id: 1,
        name: 'pety'
      }));
      await bautaJS.bootstrap();

      expect(await bautaJS.operations.operation1.run({ req, res })).toStrictEqual({
        id: 1,
        name: 'pety'
      });
    });

    test('should validate the response if is set true globally', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 123
        }
      };
      const res = {};

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        enableResponseValidation: true,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });

      bautaJS.operations.operation1.setup(() => ({
        id: 1,
        name: 'pety'
      }));

      await bautaJS.bootstrap();

      await expect(() => bautaJS.operations.operation1.run({ req, res })).toThrow(
        expect.objectContaining({
          name: 'Validation Error',
          errors: [
            {
              path: '',
              location: 'response',
              message: 'should be array',
              errorCode: 'type'
            }
          ],
          statusCode: 500,
          response: {
            id: 1,
            name: 'pety'
          },
          message: 'Internal error'
        })
      );
    });

    test('should priorize the local operation toggle over the global one', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 123
        }
      };
      const res = {};

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        enableResponseValidation: false,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });

      bautaJS.operations.operation1.validateResponse(true).setup(() => ({
        id: 1,
        name: 'pety'
      }));

      await bautaJS.bootstrap();

      await expect(() => bautaJS.operations.operation1.run({ req, res })).toThrow(
        expect.objectContaining({
          name: 'Validation Error',
          errors: [
            {
              path: '',
              location: 'response',
              message: 'should be array',
              errorCode: 'type'
            }
          ],
          statusCode: 500,
          response: {
            id: 1,
            name: 'pety'
          },
          message: 'Internal error'
        })
      );
    });
  });

  describe('load resolvers from path', () => {
    test('should load the operations from the given path', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });

      expect(
        await bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
      ).toStrictEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should load the resolvers from the given array of paths', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolversPath: [
          path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
          path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver-1.js')
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();

      expect(
        await bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
      ).toStrictEqual([
        {
          id: 132,
          name: 'pet1'
        }
      ]);
    });
  });

  describe('execution cancellation', () => {
    test('should allow cancel a execution chain', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(async () => {
              await new Promise(resolve =>
                setTimeout(() => {
                  resolve({});
                }, 5000)
              );
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      }) as CancelablePromise<any>;

      const doRequest = async () => {
        await expect(request1).rejects.toThrow(
          expect.objectContaining({ message: 'Promise was canceled' })
        );
      };

      request1.cancel();

      await doRequest();
      expect.assertions(1);
    });

    // eslint-disable-next-line jest/no-done-callback
    test('should set the token variable isCanceled to true if the chain is canceled', async done => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(
              pipe(async (_, ctx) => {
                ctx.token.onCancel(() => {
                  expect(ctx.token.isCanceled).toStrictEqual(true);
                  done();
                });
                await new Promise(resolve =>
                  setTimeout(() => {
                    resolve({});
                  }, 5000)
                );
              })
            );
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      }) as CancelablePromise<any>;

      expect.assertions(1);
      request1.cancel();
      try {
        await request1;
      } catch (e) {
        // No need to control error
      }
    });

    test('should allow custom cancel reason', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(async () => {
              await new Promise(resolve =>
                setTimeout(() => {
                  resolve({});
                }, 5000)
              );
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      }) as CancelablePromise<any>;
      const doRequest = async () => {
        await expect(request1).rejects.toThrow(
          expect.objectContaining({ message: 'Request was aborted' })
        );
      };
      request1.cancel('Request was aborted');
      await doRequest();
      expect.assertions(1);
    });

    test('should execute all onCancel that where subscribed', async () => {
      const onCancel = jest.fn();
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(
              pipe(
                (_, ctx) => {
                  ctx.token.onCancel(onCancel);
                },
                (_, ctx) => {
                  ctx.token.onCancel(onCancel);
                },
                (_, ctx) => {
                  ctx.token.onCancel(onCancel);
                },
                async () => {
                  await new Promise(resolve =>
                    setTimeout(() => {
                      resolve({});
                    }, 5000)
                  );
                }
              )
            );
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      }) as CancelablePromise<any>;

      request1.cancel();

      try {
        await request1;
      } catch (error) {
        // Not interested on the error
      }
      expect(onCancel).toHaveBeenCalledTimes(3);
    });

    test('should not mix concurrent executions', async () => {
      const onCancel: OnCancel = jest.fn();
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(
              pipe(
                (_, ctx) => {
                  ctx.token.onCancel(onCancel);
                },
                async () => {
                  return new Promise(resolve =>
                    setTimeout(() => {
                      resolve({});
                    }, 1000)
                  );
                },
                (_, ctx) => {
                  ctx.token.onCancel(onCancel);

                  return 'ok';
                }
              )
            );
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      }) as CancelablePromise<any>;
      const request2 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      }) as CancelablePromise<any>;

      request1.cancel();
      // eslint-disable-next-line jest/valid-expect-in-promise
      const [, req2] = await Promise.all([request1.catch(() => Promise.resolve()), request2]);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(req2).toStrictEqual('ok');
    });
  });

  describe('inheritance between api versions (inheritOperationsFrom)', () => {
    test('should throw an error if no bautajs instance is passed to the inheritOperationsFrom method', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV2 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      // @ts-ignore
      expect(() => bautaJSV2.inheritOperationsFrom({})).toThrow(
        new Error('A bautaJS instance must be provided.')
      );
    });
    test('should inherit the given operations from another bautajs instance on use inheritOperationsFrom', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV1 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'okv1';
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      const bautaJSV2 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      bautaJSV2.inheritOperationsFrom(bautaJSV1);
      await Promise.all([bautaJSV1.bootstrap(), bautaJSV2.bootstrap()]);
      const request1 = (await bautaJSV1.operations.operation1.run({
        req: { query: {} },
        res: {}
      })) as CancelablePromise<any>;
      const request2 = (await bautaJSV2.operations.operation1.run({
        req: { query: {} },
        res: {}
      })) as CancelablePromise<any>;

      expect(request1).toStrictEqual(request2);
    });
    test('on setup an inherit operation the handler should be override', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV1 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'okv1';
            });
            operations.operationInherited.validateResponse(false).setup(() => {
              return 'okoperationInherited';
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      const bautaJSV2 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'okv2';
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      bautaJSV2.inheritOperationsFrom(bautaJSV1);
      await Promise.all([bautaJSV1.bootstrap(), bautaJSV2.bootstrap()]);
      const request1 = (await bautaJSV1.operations.operation1.run({
        req: { query: {} },
        res: {}
      })) as CancelablePromise<any>;
      const request2 = (await bautaJSV2.operations.operation1.run({
        req: { query: {} },
        res: {}
      })) as CancelablePromise<any>;
      const request3 = (await bautaJSV2.operations.operationInherited.run({
        req: { query: {} },
        res: {}
      })) as CancelablePromise<any>;

      expect(request1).not.toStrictEqual(request2);
      expect(request3).toStrictEqual('okoperationInherited');
    });
    test('should not inherit deprecated operations on use inheritOperationsFrom', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV1 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1
              .setAsDeprecated()
              .validateResponse(false)
              .setup(() => {
                return 'okv1';
              });
            operations.operationInherited.validateResponse(false).setup(() => {
              return 'okoperationInherited';
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      const bautaJSV2 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      bautaJSV2.inheritOperationsFrom(bautaJSV1);
      await Promise.all([bautaJSV1.bootstrap(), bautaJSV2.bootstrap()]);
      const request3 = (await bautaJSV2.operations.operationInherited.run({
        req: { query: {} },
        res: {}
      })) as CancelablePromise<any>;

      expect(Object.prototype.hasOwnProperty.call(bautaJSV2.operations, 'operation1')).toBeFalsy();
      expect(request3).toStrictEqual('okoperationInherited');
    });
    test('operations can not be inherit after bootstrap', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV1 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1
              .setAsDeprecated()
              .validateResponse(false)
              .setup(() => {
                return 'okv1';
              });
            operations.operationInherited.validateResponse(false).setup(() => {
              return 'okoperationInherited';
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      const bautaJSV2 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJSV2.bootstrap();

      expect(() => bautaJSV2.inheritOperationsFrom(bautaJSV1)).toThrow(
        new Error('Operation inherit should be done before bootstrap the BautaJS instance.')
      );
    });

    test('operation schema should be inherit in case that is not present in the new api definition', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV1 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.getPet.validateResponse(false).setup(() => {
              return 'okv1';
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      const bautaJSV2 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJSV1.bootstrap();
      bautaJSV2.inheritOperationsFrom(bautaJSV1);
      await bautaJSV2.bootstrap();

      expect(bautaJSV1.operations.getPet.schema).toStrictEqual(bautaJSV2.operations.getPet.schema);
    });

    test('operation schema of inherited instance should be override for the new version one', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV1 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'okv1';
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      const bautaJSV2 = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      bautaJSV2.inheritOperationsFrom(bautaJSV1);
      await Promise.all([bautaJSV1.bootstrap(), bautaJSV2.bootstrap()]);
      expect(bautaJSV1.operations.operation1.schema).not.toStrictEqual(
        bautaJSV2.operations.operation1.schema
      );
    });
  });

  describe('private operations', () => {
    test('should set operation as private by default if the setup is not done', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });

      expect.assertions(1);
      expect(bautaJS.operations.operation1.isPrivate()).toStrictEqual(true);
    });

    test('should set as public automatically if the setup is done for the operation', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'ok';
            });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1.isPrivate()).toStrictEqual(false);
    });

    test('should set as private if we specified even thought we did setup the operation', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS<{
        req: any;
        res: { statusCode: number; headersSent: boolean; finished: boolean };
      }>({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1
              .validateResponse(false)
              .setAsPrivate()
              .setup(() => {
                return 'ok';
              });
          })
        ],
        staticConfig: config,
        getRequest(raw): any {
          return raw.req;
        },
        getResponse(raw) {
          return {
            statusCode: raw.res.statusCode,
            isResponseFinished: raw.res.headersSent || raw.res.finished
          };
        }
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1.isPrivate()).toStrictEqual(true);
    });
  });
});
