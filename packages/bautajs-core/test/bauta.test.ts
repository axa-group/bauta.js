import fastSafeStringify from 'fast-safe-stringify';
import path from 'path';
import { BautaJS, pipe, resolver, OnCancel, Document, CancelablePromise } from '../src/index';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';
import testApiDefinitions2VersionsJson from './fixtures/test-api-definition-2-versions.json';

describe('bauta core tests', () => {
  describe('core initialization tests', () => {
    test('should initialize the core with the given parameters', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
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
          new BautaJS({
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

      const bautaJS = new BautaJS({
        staticConfig: config,

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

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,

        resolvers: [
          operations => {
            operations.operation1.setup(() => 'ok');
          }
        ]
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1).toBeDefined();
      expect(bautaJS.operations.operation2).toBeUndefined();
    });
  });

  describe('validate request globally', () => {
    test('should validate the given request', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const req = {
        query: {
          limit: 'string'
        }
      };

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });

      await bautaJS.bootstrap();

      expect(() => bautaJS.operations.operation1.validateRequestSchema(req)).toThrow(
        expect.objectContaining({
          message: 'The request was not valid',
          errors: [
            {
              path: '/limit',
              location: 'query',
              message: 'must be integer',
              errorCode: 'type'
            }
          ]
        })
      );
    });

    test('should not suggest validate the request if validateRequest is set to false globally', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        enableRequestValidation: false,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js')
      });
      await bautaJS.bootstrap();

      expect(bautaJS.operations.operation1.shouldValidateRequest()).toBe(false);
    });

    test('should use the local operation request validation toggle over the global one', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        enableRequestValidation: false
      });
      bautaJS.operations.operation1.validateRequest(true);
      await bautaJS.bootstrap();

      expect(bautaJS.operations.operation1.shouldValidateRequest()).toBe(true);
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

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          operations => {
            operations.operation1.validateResponse(true).setup((_, ctx) => {
              const response = [{ id: '22' }];
              ctx.validateResponseSchema(response, 200);

              return response;
            });
          }
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();

      expect.assertions(1);
      try {
        await bautaJS.operations.operation1.run({ req, res });
      } catch (e: any) {
        expect(e.stack).toBe(`${e.name}: ${e.message} \n ${fastSafeStringify(e, undefined, 2)}`);
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

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config
      });
      bautaJS.operations.operation1.setup(() => ({
        id: 1,
        name: 'pety'
      }));
      await bautaJS.bootstrap();

      await expect(bautaJS.operations.operation1.run({ req, res })).resolves.toStrictEqual({
        id: 1,
        name: 'pety'
      });
    });

    test('should suggest response validation if is set true globally', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        enableResponseValidation: true
      });

      bautaJS.operations.operation1.setup(() => ({
        id: 1,
        name: 'pety'
      }));

      await bautaJS.bootstrap();

      expect(bautaJS.operations.operation1.shouldValidateResponse(200)).toBe(true);
    });

    test('should prioritize the local operation toggle over the global one', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        staticConfig: config,
        enableResponseValidation: false
      });

      bautaJS.operations.operation1.validateResponse(true).setup(() => ({
        id: 1,
        name: 'pety'
      }));

      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1.shouldValidateResponse(200)).toBe(true);
    });
  });

  describe('load resolvers from path', () => {
    test('should load the operations from the given path', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolversPath: path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
        staticConfig: config
      });

      await expect(
        bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
      ).resolves.toStrictEqual([
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

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolversPath: [
          path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver.js'),
          path.resolve(__dirname, './fixtures/test-resolvers/operation-resolver-1.js')
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();

      await expect(
        bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
      ).resolves.toStrictEqual([
        {
          id: 132,
          name: 'pet1'
        }
      ]);
    });

    test('should load the resolvers from the given array of windows paths', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolversPath: [
          `${__dirname}\\fixtures\\test-resolvers\\operation-resolver.js`,
          `${__dirname}\\fixtures\\test-resolvers\\operation-resolver-1.js`
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();

      await expect(
        bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
      ).resolves.toStrictEqual([
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
      const bautaJS = new BautaJS({
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
        staticConfig: config
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

    test('should set the token variable isCanceled to true if the chain is canceled', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.setup(
              pipe(async (_, ctx) => {
                ctx.token.onCancel(() => {
                  expect(ctx.token.isCanceled).toBe(true);
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
      const request1 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      }) as CancelablePromise<any>;

      expect.assertions(2);
      request1.cancel();

      await expect(request1).rejects.toThrow(
        expect.objectContaining({ message: 'Promise was canceled' })
      );
    });

    test('should allow custom cancel reason', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS({
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
        staticConfig: config
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
      const bautaJS = new BautaJS({
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
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      }) as CancelablePromise<any>;

      request1.cancel();

      await expect(request1).rejects.toThrow(
        expect.objectContaining({ message: 'Promise was canceled' })
      );
      expect(onCancel).toHaveBeenCalledTimes(3);
    });

    test('should not mix concurrent executions', async () => {
      const onCancel: OnCancel = jest.fn();
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS({
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
        staticConfig: config
      });
      await bautaJS.bootstrap();
      const request1 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      });
      const request2 = bautaJS.operations.operation1.run({
        req: { query: {} },
        res: {}
      });
      request1.cancel();
      expect.assertions(3);

      const [, req2] = await Promise.all([
        request1.catch((e: any) => {
          expect(e).toStrictEqual(expect.objectContaining({ message: 'Promise was canceled' }));
          return Promise.resolve({});
        }),
        request2
      ]);

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(req2).toBe('ok');
    });
  });

  describe('inheritance between api versions (inheritOperationsFrom)', () => {
    test('should throw an error if no bautajs instance is passed to the inheritOperationsFrom method', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV2 = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config
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
      const bautaJSV1 = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'okv1';
            });
          })
        ],
        staticConfig: config
      });
      const bautaJSV2 = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config
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
      const bautaJSV1 = new BautaJS({
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
        staticConfig: config
      });
      const bautaJSV2 = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'okv2';
            });
          })
        ],
        staticConfig: config
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
      expect(request3).toBe('okoperationInherited');
    });
    test('should not inherit deprecated operations on use inheritOperationsFrom', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV1 = new BautaJS({
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
        staticConfig: config
      });
      const bautaJSV2 = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config
      });
      bautaJSV2.inheritOperationsFrom(bautaJSV1);
      await Promise.all([bautaJSV1.bootstrap(), bautaJSV2.bootstrap()]);
      const request3 = (await bautaJSV2.operations.operationInherited.run({
        req: { query: {} },
        res: {}
      })) as CancelablePromise<any>;

      expect(Object.prototype.hasOwnProperty.call(bautaJSV2.operations, 'operation1')).toBeFalsy();
      expect(request3).toBe('okoperationInherited');
    });
    test('operations can not be inherit after bootstrap', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJSV1 = new BautaJS({
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
        staticConfig: config
      });
      const bautaJSV2 = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config
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
      const bautaJSV1 = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.getPet.validateResponse(false).setup(() => {
              return 'okv1';
            });
          })
        ],
        staticConfig: config
      });
      const bautaJSV2 = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config
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
      const bautaJSV1 = new BautaJS({
        apiDefinition: testApiDefinitionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'okv1';
            });
          })
        ],
        staticConfig: config
      });
      const bautaJSV2 = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [resolver(() => {})],
        staticConfig: config
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
      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [],
        staticConfig: config
      });

      expect.assertions(1);
      expect(bautaJS.operations.operation1.isPrivate()).toBe(true);
    });

    test('should set as public automatically if the setup is done for the operation', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS({
        apiDefinition: testApiDefinitions2VersionsJson as Document,
        resolvers: [
          resolver(operations => {
            operations.operation1.validateResponse(false).setup(() => {
              return 'ok';
            });
          })
        ],
        staticConfig: config
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1.isPrivate()).toBe(false);
    });

    test('should set as private if we specified even thought we did setup the operation', async () => {
      const config = {
        endpoint: 'http://google.es'
      };
      const bautaJS = new BautaJS({
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
        staticConfig: config
      });
      await bautaJS.bootstrap();
      expect(bautaJS.operations.operation1.isPrivate()).toBe(true);
    });
  });
});
