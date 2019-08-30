/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the 'License'); you
 * may not use this file except in compliance with the License.
 * A copy of the License can be found in the LICENSE.TXT file distributed
 * together with this file.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import fastSafeStringify from 'fast-safe-stringify';
import path from 'path';
import { BautaJS, resolver } from '../index';
import { OnCancel, Document } from '../utils/types';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testApiDefinitions2VersionsJson from './fixtures/test-api-definition-2-versions.json';

describe('Core tests', () => {
  describe('Express initialization tests', () => {
    test('should initialize the core with the given parameters', () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config
      });
      expect(bautaJS.operations.v1.operation1).toBeDefined();
    });

    test('should initialize the core with the given api versions', () => {
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
      ).toThrow(`Invalid API definitions, "" should have required property 'swagger'`);
    });
  });

  describe('Validate request globally', () => {
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
        staticConfig: config
      });

      try {
        await bautaJS.operations.v1.operation1.run({ req, res });
      } catch (e) {
        expect(e.errors).toEqual([
          {
            errorCode: 'type.openapi.validation',
            location: 'query',
            message: 'should be integer',
            path: 'limit'
          }
        ]);
      }
    });

    test('should not validate the request if set validateRequest to false', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };
      const res = {};

      const bautaJS = new BautaJS(
        [{ ...testApiDefinitionsJson[0], validateRequest: false }] as Document[],
        {
          resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
          staticConfig: config
        }
      );

      expect(await bautaJS.operations.v1.operation1.run({ req, res })).toEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });

    test('should validate the request and print the stack object', async () => {
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
        staticConfig: config
      });

      try {
        await bautaJS.operations.v1.operation1.run({ req, res });
      } catch (e) {
        expect(e.stack).toEqual(`${e.name}: ${e.message} \n ${fastSafeStringify(e, undefined, 2)}`);
      }
    });
  });

  describe('Validate response globally', () => {
    test('should validate the response by default', async () => {
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

      try {
        await bautaJS.operations.v1.operation1.run({ req, res });
      } catch (e) {
        expect(e.errors).toEqual([
          {
            errorCode: 'type.openapi.responseValidation',
            message: 'response should be array'
          }
        ]);
        expect(e.response).toEqual({
          id: 1,
          name: 'pety'
        });
      }
    });

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

      bautaJS.operations.v1.operation1.setup(p => p.push(() => [{ id: '22' }]));

      try {
        await bautaJS.operations.v1.operation1.run({ req, res });
      } catch (e) {
        expect(e.stack).toEqual(`${e.name}: ${e.message} \n ${fastSafeStringify(e, undefined, 2)}`);
      }
    });

    test('should not validate the response if set validateResponse to false', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 123
        }
      };
      const res = {};

      const bautaJS = new BautaJS(
        [{ ...testApiDefinitionsJson[0], validateResponse: false }] as Document[],
        {
          resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
          staticConfig: config
        }
      );

      await bautaJS.operations.v1.operation1.run({ req, res });
      expect(await bautaJS.operations.v1.operation1.run({ req, res })).toEqual([
        {
          id: 134,
          name: 'pet2'
        }
      ]);
    });
  });

  describe('Load resolvers from path', () => {
    test('should load the operations from the given path', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config
      });

      expect(await bautaJS.operations.v1.operation1.run({ req: {}, res: {} })).toEqual([
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

      expect(await bautaJS.operations.v1.operation1.run({ req: {}, res: {} })).toEqual([
        {
          id: 132,
          name: 'pet1'
        }
      ]);
    });
  });

  describe('Execution cancelation', () => {
    test('should allow cancel a execution chain', done => {
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
                    resolve();
                  }, 5000)
                );
              })
            );
          })
        ],
        staticConfig: config
      });
      const request1 = bautaJS.operations.v1.operation1.run({ req: {}, res: {} });

      (async () => {
        try {
          await request1;
          expect(true).toBeFalsy();
        } catch (e) {
          expect(e.message).toEqual('Promise was canceled');
          done();
        }
      })();

      request1.cancel();
    });

    test('should set the token variable isCanceled to true if the chain is canceled', done => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.setup(p =>
              p.push(async (_, ctx) => {
                ctx.token.onCancel(() => {
                  expect(ctx.token.isCanceled).toEqual(true);
                  done();
                });
                await new Promise(resolve =>
                  setTimeout(() => {
                    resolve();
                  }, 5000)
                );
              })
            );
          })
        ],
        staticConfig: config
      });
      const request1 = bautaJS.operations.v1.operation1.run({ req: {}, res: {} });

      (async () => {
        try {
          await request1;
        } catch (e) {
          // eslint-disable-next-line;
        }
      })();

      request1.cancel();
    });

    test('should allow custom cancel reason', done => {
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
                    resolve();
                  }, 5000)
                );
              })
            );
          })
        ],
        staticConfig: config
      });
      const request1 = bautaJS.operations.v1.operation1.run({ req: {}, res: {} });

      (async () => {
        try {
          await request1;
          expect(true).toBeFalsy();
        } catch (e) {
          expect(e.message).toEqual('Request was aborted');
          done();
        }
      })();

      request1.cancel('Request was aborted');
    });

    test('should execute all onCancel that where subscribed', done => {
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
                      resolve();
                    }, 5000)
                  );
                })
            );
          })
        ],
        staticConfig: config
      });
      const request1 = bautaJS.operations.v1.operation1.run({ req: {}, res: {} });

      (async () => {
        try {
          await request1;
          expect(true).toBeFalsy();
        } catch (error) {
          expect(onCancel).toHaveBeenCalledTimes(3);
          done();
        }
      })();

      request1.cancel();
    });

    test('should not mix concurrent executions', done => {
      const onCancel: OnCancel = jest.fn();
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.validateResponses(false).setup(p =>
              p
                .push((_, ctx) => {
                  ctx.token.onCancel(onCancel);
                })
                .push(async () => {
                  return new Promise(resolve =>
                    setTimeout(() => {
                      resolve();
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
      const request1 = bautaJS.operations.v1.operation1.run({ req: {}, res: {} });
      const request2 = bautaJS.operations.v1.operation1.run({ req: {}, res: {} });

      (async () => {
        try {
          await request1;
        } catch (error) {
          // eslint-disable-next-line
        }
      })();
      (async () => {
        try {
          const result = await request2;
          expect(onCancel).toHaveBeenCalledTimes(1);
          expect(result).toEqual('ok');
          done();
        } catch (error) {
          done(error);
        }
      })();

      request1.cancel();
    });
  });

  describe('Inheritance between api versions', () => {
    test('should inherit by default the operation pipeline', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v2.operation1.validateResponses(false);
            operations.v1.operation1.validateResponses(false).setup(p =>
              p.push(() => {
                return 'ok';
              })
            );
          })
        ],
        staticConfig: config
      });
      const request1 = await bautaJS.operations.v1.operation1.run({ req: {}, res: {} });
      const request2 = await bautaJS.operations.v2.operation1.run({ req: {}, res: {} });

      expect(request1).toEqual(request2);
    });

    test('Version 2 should override the setup done by v1', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.validateResponses(false).setup(p =>
              p.push(() => {
                return {
                  key: 1
                };
              })
            );

            operations.v2.operation1.validateResponses(false).setup(p =>
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
      const request1 = await bautaJS.operations.v1.operation1.run({ req: {}, res: {} });
      const request2 = await bautaJS.operations.v2.operation1.run({ req: {}, res: {} });

      expect(request2).not.toEqual(request1);
      expect(request2).toEqual({ key: 2 });
    });

    test('Version 2 should override v1 behaviour even if they are not loaded in order', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v2.operation1.validateResponses(false).setup(p =>
              p.push((response: any = {}) => {
                return {
                  ...response,
                  key: 2
                };
              })
            );
          }),
          resolver(operations => {
            operations.v1.operation1.validateResponses(false).setup(p =>
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
      const request1 = await bautaJS.operations.v1.operation1.run({ req: {}, res: {} });
      const request2 = await bautaJS.operations.v2.operation1.run({ req: {}, res: {} });

      expect(request2).not.toEqual(request1);
      expect(request2).toEqual({ key: 2 });
    });

    test('Should not inherit from v1 id the operation was marked as deprecated', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1
              .setAsDeprecated()
              .validateResponses(false)
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
      let error;
      try {
        await bautaJS.operations.v2.operation1.run({ req: {}, res: {} });
      } catch (e) {
        error = e;
      }

      expect(error).toEqual(new Error('Not found'));
    });

    test('Error handler should be inherit by default', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.validateResponses(false).setup(p =>
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
      let error1;
      let error2;
      try {
        await bautaJS.operations.v1.operation1.run({ req: {}, res: {} });
      } catch (e) {
        error1 = e;
      }

      try {
        await bautaJS.operations.v2.operation1.run({ req: {}, res: {} });
      } catch (e) {
        error2 = e;
      }

      expect(error1).toEqual(error2);
    });
  });

  describe('Private operations', () => {
    test('should set operation as private by default if the setup is not done', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [],
        staticConfig: config
      });

      expect(bautaJS.apiDefinitions[0].paths).toEqual({});
    });

    test('should set as public automatically if the setup is done for the operation', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1.validateResponses(false).setup(p =>
              p.push(() => {
                return 'ok';
              })
            );
          })
        ],
        staticConfig: config
      });
      expect(bautaJS.apiDefinitions[0].paths['/test'].get.operationId).toEqual(
        bautaJS.operations.v1.operation1.id
      );
    });

    test('should set as private if we specified even thought we did setup the operation', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS(testApiDefinitions2VersionsJson as Document[], {
        resolvers: [
          resolver(operations => {
            operations.v1.operation1
              .validateResponses(false)
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
      expect(bautaJS.apiDefinitions[0].paths).toEqual({});
    });
  });
});
