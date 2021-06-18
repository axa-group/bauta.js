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
import { BautaJS, resolver } from '../index';
import { Document } from '../types';
import circularSchema from './fixtures/circular-schema.json';
import formatSchema from './fixtures/schema-with-format.json';
import nullableSchema from './fixtures/nullable-schema.json';
import customFormatSchema from './fixtures/schema-with-custom-format.json';
import schemaTwoOperations from './fixtures/schema-two-operations.json';
import schemaWithoutDefaultResponse from './fixtures/schema-without-default-response.json';

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
          operations.operation1.validateResponse(true).setup(() => {
            return expected;
          });
        })
      ],
      staticConfig: config,
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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
          operations.operation1.validateResponse(true).setup(() => {
            return expected;
          });
        })
      ],
      staticConfig: config,
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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
          operations.operation1.validateResponse(true).setup(() => {
            return expected;
          });
        })
      ],
      staticConfig: config,
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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
          operations.operation1.validateResponse(true).setup(() => {
            return expected;
          });
        })
      ],
      staticConfig: config,
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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
          operations.operation1.setup(() => {
            return anyResponse;
          });
        })
      ],
      staticConfig: config,
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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
          operations.operation1.validateResponse(true).setup(() => {
            return expected;
          });
          operations.operation2.validateResponse(true).setup(() => {
            return expected;
          });
        })
      ],
      staticConfig: config,
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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
            (ctx as any).raw.res.statusCode = 200;
            return [
              {
                id: 123,
                name: 'pet'
              }
            ];
          });
        })
      ],
      getResponse(rawParam) {
        return {
          isResponseFinished: false,
          statusCode: rawParam.statusCode as number
        };
      },
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
          operations.operation1.validateResponse(true).setup(() => {
            return expected;
          });
        })
      ],
      staticConfig: config,
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      },
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
          operations.operation1.validateResponse(true).setup(() => {
            return expected;
          });
        })
      ],
      staticConfig: config,
      customValidationFormats: [
        {
          name: 'customIdFormat',
          type: 'number',
          validate: n => Number.isInteger(0) && n > 0
        }
      ],
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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

    const bautaJS = new BautaJS({
      apiDefinition: customFormatSchema as Document,
      resolvers: [
        resolver(operations => {
          operations.operation1.validateResponse(true).setup(() => {
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
      ],
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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
          operations.operation1.validateResponse(true).setup(() => {
            return expected;
          });
        })
      ],
      staticConfig: config,
      customValidationFormats: [
        {
          name: 'customTagFormat',
          type: 'string',
          validate: new RegExp(
            '^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9]) (2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?$'
          )
        }
      ],
      getRequest(raw: any): any {
        return raw.req;
      },
      getResponse(raw: any) {
        return {
          statusCode: raw.res.statusCode,
          isResponseFinished: raw.res.headersSent || raw.res.finished
        };
      }
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
