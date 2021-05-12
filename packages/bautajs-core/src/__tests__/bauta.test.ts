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
import { BautaJS, resolver } from '../index';
import { OnCancel, Document } from '../types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testApiDefinitions2VersionsJson from './fixtures/test-api-definition-2-versions.json';

describe('bauta core tests', () => {
  describe('core initialization tests', () => {
    test('should initialize the core with the given parameters', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.v1.operation1).toBeDefined();
    });

    test('should initialize the core with the given api versions', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(
        [
          testApiDefinitionsJson[0],
          {
            ...testApiDefinitionsJson[0],
            info: { version: 'v2', title: '1' }
          }
        ] as Document[],
        {
          staticConfig: config
        }
      );

      await bautaJS.bootstrap();

      expect(bautaJS.operations.v1.operation1).toBeDefined();
      expect(bautaJS.operations.v2.operation1).toBeDefined();
    });

    test('should throw an error for a not valid testApi definition', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      expect(
        () =>
          // @ts-ignore
          new BautaJS([{}], {
            staticConfig: config
          })
      ).toThrow('The Openapi API definition provided is not valid.');
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });
      await bautaJS.bootstrap();

      await expect(bautaJS.operations.v1.operation1.run({ req, res })).rejects.toThrow(
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config,
        enableRequestValidation: false,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });
      await bautaJS.bootstrap();

      expect(await bautaJS.operations.v1.operation1.run({ req, res })).toStrictEqual([
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        enableRequestValidation: false
      });
      bautaJS.operations.v1.operation1.validateRequest(true);
      await bautaJS.bootstrap();

      await expect(bautaJS.operations.v1.operation1.run({ req, res })).rejects.toThrow(
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config
      });

      bautaJS.operations.v1.operation1
        .validateResponse(true)
        .setup(p => p.push(() => [{ id: '22' }]));

      await bautaJS.bootstrap();

      await expect(bautaJS.operations.v1.operation1.run({ req, res })).rejects.toThrow(
        expect.objectContaining({
          stack: `Validation Error: Internal error \n ${fastSafeStringify(
            {
              name: 'Validation Error',
              errors: [
                {
                  path: '[0].id',
                  location: 'response',
                  message: 'should be integer',
                  errorCode: 'type'
                },
                {
                  path: '[0]',
                  location: 'response',
                  message: "should have required property 'name'",
                  errorCode: 'required'
                }
              ],
              statusCode: 500,
              response: [
                {
                  id: '22'
                }
              ],
              message: 'Internal error'
            },
            undefined,
            2
          )}`
        })
      );
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config
      });
      bautaJS.operations.v1.operation1.setup(p =>
        p.push(() => ({
          id: 1,
          name: 'pety'
        }))
      );
      await bautaJS.bootstrap();

      expect(await bautaJS.operations.v1.operation1.run({ req, res })).toStrictEqual({
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config,
        enableResponseValidation: true
      });

      bautaJS.operations.v1.operation1.setup(p =>
        p.push(() => ({
          id: 1,
          name: 'pety'
        }))
      );

      await bautaJS.bootstrap();

      await expect(bautaJS.operations.v1.operation1.run({ req, res })).rejects.toThrow(
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config,
        enableResponseValidation: false
      });

      bautaJS.operations.v1.operation1.validateResponse(true).setup(p =>
        p.push(() => ({
          id: 1,
          name: 'pety'
        }))
      );

      await bautaJS.bootstrap();

      await expect(bautaJS.operations.v1.operation1.run({ req, res })).rejects.toThrow(
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config
      });

      expect(
        await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} })
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

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolversPath: [
          path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
          path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver-1.js')
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();

      expect(
        await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} })
      ).toStrictEqual([
        {
          id: 132,
          name: 'pet1'
        }
      ]);
    });
  });

  describe('execution cancelation', () => {
    test('should allow cancel a execution chain', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(p =>
              p.push(async () => {
                await new Promise(resolve =>
                  setTimeout(() => {
                    resolve({});
                  }, 5000)
                );
              })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });

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
      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(p =>
              p.push(async (_, ctx) => {
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
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });

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
      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(p =>
              p.push(async () => {
                await new Promise(resolve =>
                  setTimeout(() => {
                    resolve({});
                  }, 5000)
                );
              })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });
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
      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(p =>
              p
                .push((_, ctx) => {
                  ctx.token.onCancel(onCancel);
                })
                .push((_, ctx) => {
                  ctx.token.onCancel(onCancel);
                })
                .push((_, ctx) => {
                  ctx.token.onCancel(onCancel);
                })
                .push(async () => {
                  await new Promise(resolve =>
                    setTimeout(() => {
                      resolve({});
                    }, 5000)
                  );
                })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });

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
      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.validateResponse(false).setup(p =>
              p
                .push((_, ctx) => {
                  ctx.token.onCancel(onCancel);
                })
                .push(async () => {
                  return new Promise(resolve =>
                    setTimeout(() => {
                      resolve({});
                    }, 1000)
                  );
                })
                .push((_, ctx) => {
                  ctx.token.onCancel(onCancel);

                  return 'ok';
                })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });
      const request2 = bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });

      request1.cancel();
      // eslint-disable-next-line jest/valid-expect-in-promise
      const [, req2] = await Promise.all([request1.catch(() => Promise.resolve()), request2]);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(req2).toStrictEqual('ok');
    });
  });

  describe('inheritance between api versions', () => {
    test('should inherit by default the operation pipeline', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v2.operation1.validateResponse(false);
            operations.v1.operation1.validateResponse(false).setup(p =>
              p.push(() => {
                return 'ok';
              })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });
      const request2 = await bautaJS.operations.v2.operation1.run({ req: { query: {} }, res: {} });

      expect(request1).toStrictEqual(request2);
    });

    test('version 2 should override the setup done by v1', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.validateResponse(false).setup(p =>
              p.push(() => {
                return {
                  key: 1
                };
              })
            );

            operations.v2.operation1.validateResponse(false).setup(p =>
              p.push((response: any = {}) => {
                return {
                  ...response,
                  key: 2
                };
              })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });
      const request2 = await bautaJS.operations.v2.operation1.run({ req: { query: {} }, res: {} });

      expect(request2).not.toStrictEqual(request1);
      expect(request2).toStrictEqual({ key: 2 });
    });

    test('version 2 should override v1 behaviour even if they are not loaded in order', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v2.operation1.validateResponse(false).setup(p =>
              p.push((response: any = {}) => {
                return {
                  ...response,
                  key: 2
                };
              })
            );
          }),
          resolver(operations => {
            operations.v1.operation1.validateResponse(false).setup(p =>
              p.push(() => {
                return {
                  key: 1
                };
              })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });
      const request2 = await bautaJS.operations.v2.operation1.run({ req: { query: {} }, res: {} });

      expect(request2).not.toStrictEqual(request1);
      expect(request2).toStrictEqual({ key: 2 });
    });

    test('should not inherit from v1 id the operation was marked as deprecated', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1
              .setAsDeprecated()
              .validateResponse(false)
              .setup(p =>
                p.push(() => {
                  return {
                    key: 1
                  };
                })
              );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      await expect(
        bautaJS.operations.v2.operation1.run({ req: { query: {} }, res: {} })
      ).rejects.toThrow(new Error('Not found'));
    });

    test('error handler should be inherit by default', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.validateResponse(false).setup(p =>
              p
                .push(() => {
                  return Promise.reject(new Error('error'));
                })
                .onError(() => {
                  return Promise.reject(new Error('An error occured'));
                })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      let error1;
      let error2;
      try {
        await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} });
      } catch (e) {
        error1 = e;
      }

      try {
        await bautaJS.operations.v2.operation1.run({ req: { query: {} }, res: {} });
      } catch (e) {
        error2 = e;
      }

      expect(error1).toStrictEqual(error2);
    });
  });

  describe('private operations', () => {
    test('should set operation as private by default if the setup is not done', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [],
        staticConfig: config
      });
      await bautaJS.bootstrap();

      expect.assertions(1);
      Object.keys(bautaJS.operations.v1).map((key: string) =>
        expect(bautaJS.operations.v1[key].isPrivate()).toStrictEqual(true)
      );
    });

    test('should set as public automatically if the setup is done for the operation', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.validateResponse(false).setup(p =>
              p.push(() => {
                return 'ok';
              })
            );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.v1.operation1.isPrivate()).toStrictEqual(false);
    });

    test('should set as private if we specified even thought we did setup the operation', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1
              .validateResponse(false)
              .setAsPrivate()
              .setup(p =>
                p.push(() => {
                  return 'ok';
                })
              );
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.v1.operation1.isPrivate()).toStrictEqual(true);
    });
  });
});
