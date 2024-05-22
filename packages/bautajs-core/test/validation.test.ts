import { BautaJS, resolver } from '../src/index';
import { Document, RawContext } from '../src/types';
import circularSchema from './fixtures/circular-schema.json';
import formatSchema from './fixtures/schema-with-format.json';
import nullableSchema from './fixtures/nullable-schema.json';
import customFormatSchema from './fixtures/schema-with-custom-format.json';
import schemaTwoOperations from './fixtures/schema-two-operations.json';
import schemaWithoutDefaultResponse from './fixtures/schema-without-default-response.json';
import schemaWith200ResponseCode from './fixtures/schema-with-200-response-code.json';
import schemaWith400ResponseCode from './fixtures/schema-with-400-response-code.json';
import { jest } from '@jest/globals';

describe('validation tests', () => {
  test('should allow the validation of circular schemas', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const expected = [
      {
        id: 123,
        name: 'pet',
        pets: [
          {
            id: 1234,
            name: 'pet child'
          }
        ]
      }
    ];
    const bautaJS = new BautaJS({
      apiDefinition: circularSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);
            return expected;
          });
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
    ).resolves.toStrictEqual(expected);
  });

  test('should validate a wrong circular response', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const expected = [
      {
        id: '123',
        name: 'pet',
        pets: [
          {
            id: 1234,
            name: 'pet child'
          }
        ]
      }
    ];
    const bautaJS = new BautaJS({
      apiDefinition: circularSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);
            return expected;
          });
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '/0/id',
            location: 'response',
            message: 'must be integer',
            errorCode: 'type'
          }
        ]
      })
    );
  });

  test('should validate a schema with valid formats', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const expected = [
      {
        id: 123,
        name: 'pet'
      }
    ];
    const bautaJS = new BautaJS({
      apiDefinition: formatSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);
            return expected;
          });
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
    ).resolves.toStrictEqual(expected);
  });

  test('should validate a schema with not valid formats', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const expected = [
      {
        id: '123',
        name: 'pet'
      }
    ];
    const bautaJS = new BautaJS({
      apiDefinition: formatSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);
            return expected;
          });
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.operation1.run({ req: { query: {} }, res: {} })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '/0/id',
            location: 'response',
            message: 'must be integer',
            errorCode: 'type'
          }
        ]
      })
    );
  });

  test('should validate nullable fields', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const anyResponse = [
      {
        id: 123,
        name: 'pet'
      }
    ];
    const bautaJS = new BautaJS({
      apiDefinition: nullableSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.setup((_, ctx) => {
            ctx.validateRequestSchema((ctx as RawContext<{ req: any; res: any }>).raw.req);
            return anyResponse;
          });
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.operation1.run({
        req: { query: {}, body: { some_field: null } },
        res: {}
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '/some_field',
            location: 'body',
            message: 'must be string',
            errorCode: 'type'
          }
        ]
      })
    );
  });

  test('should validate the schema of the correct operation', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const expected = [
      {
        id: 123,
        name: 'pet'
      }
    ];
    const bautaJS = new BautaJS({
      apiDefinition: schemaTwoOperations as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);
            return expected;
          });
          operations.operation2.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);
            return expected;
          });
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();

    // Should not return an error since operation2 has no parameters
    await expect(
      bautaJS.operations.operation2.run({ req: { query: {} }, res: {} })
    ).resolves.toStrictEqual(expected);
  });

  test('should validate the response schema and fail for a not found status code', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const bautaJS = new BautaJS({
      apiDefinition: schemaWithoutDefaultResponse as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            const response = [
              {
                id: 123,
                name: 'pet'
              }
            ];
            ctx.validateResponseSchema(response, 200);
            return response;
          });
        })
      ],

      staticConfig: config
    });
    await bautaJS.bootstrap();

    await expect(
      bautaJS.operations.operation1.run({
        req: { query: {}, params: { id: '1' } },
        res: { statusCode: null }
      })
    ).rejects.toThrow(
      expect.objectContaining({ message: 'Status code 200 not defined on schema' })
    );
  });
  test('should validate a success response schema to 200 status code by default', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const bautaJS = new BautaJS({
      apiDefinition: schemaWith200ResponseCode as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            const response = [
              {
                name: 'pet'
              }
            ];
            ctx.validateResponseSchema(response);
            return response;
          });
        })
      ],

      staticConfig: config
    });
    await bautaJS.bootstrap();

    await expect(
      bautaJS.operations.operation1.run({
        req: { query: {}, params: { id: '1' } },
        res: { statusCode: null }
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '/0',
            location: 'response',
            message: "must have required property 'id'",
            errorCode: 'required'
          }
        ]
      })
    );
  });

  test('should validate all custom error response schema if the thrown error has toJSON method', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const bautaJS = new BautaJS({
      apiDefinition: schemaWith400ResponseCode as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            const err = new Error('some error') as Error & {
              toJSON: () => any;
              statusCode: number;
            };
            err.toJSON = () => {
              return {
                message: 'some error',
                code: 3
              };
            };
            err.statusCode = 400;
            ctx.validateResponseSchema(err, err.statusCode);
            throw err;
          });
        })
      ],

      staticConfig: config
    });
    await bautaJS.bootstrap();

    await expect(
      bautaJS.operations.operation1.run({
        req: { query: {}, params: { id: '1' } },
        res: { statusCode: null }
      })
    ).rejects.toThrow(
      expect.objectContaining({
        message: 'some error'
      })
    );
  });

  test('should fail on error validation for custom fields if toJSON is not specified', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const bautaJS = new BautaJS({
      apiDefinition: schemaWith400ResponseCode as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            const err = new Error('some error') as Error & {
              statusCode: number;
            };
            err.statusCode = 400;
            ctx.validateResponseSchema(err, err.statusCode);
            throw err;
          });
        })
      ],

      staticConfig: config
    });
    await bautaJS.bootstrap();

    await expect(
      bautaJS.operations.operation1.run({
        req: { query: {}, params: { id: '1' } },
        res: { statusCode: null }
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '',
            location: 'response',
            message: "must have required property 'code'",
            errorCode: 'required'
          }
        ]
      })
    );
  });
});

describe('custom formats', () => {
  test('should allow override validator options', async () => {
    const logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
    const config = {
      endpoint: 'http://google.es'
    };
    // id field in the schema has a custom format that in this bauta instance is not defined, thus no error is thrown
    const expected = [
      {
        id: 123,
        name: 'pet'
      }
    ];
    const bautaJS = new BautaJS({
      apiDefinition: customFormatSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);

            return expected;
          });
        })
      ],
      staticConfig: config,
      validatorOptions: {
        logger
      }
    });
    await bautaJS.bootstrap();
    expect(logger.warn).toHaveBeenCalledWith(
      'unknown format "customIdFormat" ignored in schema at path "#/items/properties/id"'
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'unknown format "customIdFormat" ignored in schema at path "#/items/properties/id"'
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'unknown format "customTagFormat" ignored in schema at path "#/items/properties/tag"'
    );
  });

  test('should validate custom formats in a schema if they are defined as function', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    // id field in the schema has a custom format that in this bauta instance is not defined, thus no error is thrown
    const expected = [
      {
        id: -123,
        name: 'pet'
      }
    ];

    const bautaJS = new BautaJS({
      apiDefinition: customFormatSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);

            return expected;
          });
        })
      ],
      staticConfig: config,
      customValidationFormats: [
        {
          name: 'customIdFormat',
          type: 'number',
          validate: (n: any) => Number.isInteger(n) && n > 0
        }
      ]
    });

    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.operation1.run({
        req: { query: {}, body: {} },
        res: {}
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '/0/id',
            location: 'response',
            message: 'must match format "customIdFormat"',
            errorCode: 'format'
          }
        ]
      })
    );
  });

  test('should validate custom formats in a schema if they are defined as string', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    // id field in the schema has a custom format that in this bauta instance is not defined, thus no error is thrown
    const expected = [
      {
        id: 123,
        name: 'pet',
        tag: 'fistro'
      }
    ];
    const regex =
      /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9]) (2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?$/g;

    const bautaJS = new BautaJS({
      apiDefinition: customFormatSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);

            return expected;
          });
        })
      ],
      staticConfig: config,
      customValidationFormats: [
        {
          name: 'customTagFormat',
          type: 'string',
          validate: regex
        }
      ]
    });

    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.operation1.run({
        req: { query: {}, body: {} },
        res: {}
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '/0/tag',
            location: 'response',
            message: 'must match format "customTagFormat"',
            errorCode: 'format'
          }
        ]
      })
    );
  });

  test('should validate custom formats as RegEx', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    // id field in the schema has a custom format that in this bauta instance is not defined, thus no error is thrown
    const expected = [
      {
        id: 123,
        name: 'pet',
        tag: 'fistro'
      }
    ];

    const bautaJS = new BautaJS({
      apiDefinition: customFormatSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup((_, ctx) => {
            ctx.validateResponseSchema(expected);

            return expected;
          });
        })
      ],
      staticConfig: config,
      customValidationFormats: [
        {
          name: 'customTagFormat',
          type: 'string',
          validate:
            /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9]) (2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?$/
        }
      ]
    });

    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.operation1.run({
        req: { query: {}, body: {} },
        res: {}
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '/0/tag',
            location: 'response',
            message: 'must match format "customTagFormat"',
            errorCode: 'format'
          }
        ]
      })
    );
  });
});
