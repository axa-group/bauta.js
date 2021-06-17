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
    const bautaJS = new BautaJS(circularSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.push(() => {
              return expected;
            })
          );
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    expect(
      await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} })
    ).toStrictEqual(expected);
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
    const bautaJS = new BautaJS(circularSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.push(() => {
              return expected;
            })
          );
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '[0].id',
            location: 'response',
            message: 'should be integer',
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
    const bautaJS = new BautaJS(formatSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.push(() => {
              return expected;
            })
          );
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    expect(
      await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} })
    ).toStrictEqual(expected);
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
    const bautaJS = new BautaJS(formatSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.push(() => {
              return expected;
            })
          );
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '[0].id',
            location: 'response',
            message: 'should be integer',
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
    const bautaJS = new BautaJS(nullableSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.setup(p =>
            p.push(() => {
              return anyResponse;
            })
          );
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.v1.operation1.run({
        req: { query: {}, body: { some_field: null } },
        res: {}
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '.some_field',
            location: 'body',
            message: 'should be string',
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
    const bautaJS = new BautaJS(schemaTwoOperations as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.pipe(() => {
              return expected;
            })
          );
          operations.v1.operation2.validateResponse(true).setup(p =>
            p.pipe(() => {
              return expected;
            })
          );
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();

    // Should not return an error since operation2 has no parameters
    expect(
      await bautaJS.operations.v1.operation2.run({ req: { query: {} }, res: {} })
    ).toStrictEqual(expected);
  });

  test('should validate the response schema and fail for a not found status code', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const bautaJS = new BautaJS(schemaWithoutDefaultResponse as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.pipe((_, ctx) => {
              ctx.res.statusCode = 200;
              return [
                {
                  id: 123,
                  name: 'pet'
                }
              ];
            })
          );
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();

    await expect(
      bautaJS.operations.v1.operation1.run({ req: { query: {}, params: { id: '1' } }, res: {} })
    ).rejects.toThrow(
      expect.objectContaining({ message: 'Status code 200 not defined on schema' })
    );
  });
});

describe('custom formats', () => {
  test('should ignore custom formats in a schema if they are not defined', async () => {
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
    const bautaJS = new BautaJS(customFormatSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.push(() => {
              return expected;
            })
          );
        })
      ],
      staticConfig: config
    });
    await bautaJS.bootstrap();
    expect(
      await bautaJS.operations.v1.operation1.run({ req: { query: {} }, res: {} })
    ).toStrictEqual(expected);
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

    const bautaJS = new BautaJS(customFormatSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.push(() => {
              return expected;
            })
          );
        })
      ],
      staticConfig: config,
      customValidationFormats: [
        {
          name: 'customIdFormat',
          type: 'number',
          validate: n => Number.isInteger(0) && n > 0
        }
      ]
    });

    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.v1.operation1.run({
        req: { query: {}, body: {} },
        res: {}
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '[0].id',
            location: 'response',
            message: 'should match format "customIdFormat"',
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

    const bautaJS = new BautaJS(customFormatSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.push(() => {
              return expected;
            })
          );
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
      bautaJS.operations.v1.operation1.run({
        req: { query: {}, body: {} },
        res: {}
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '[0].tag',
            location: 'response',
            message: 'should match format "customTagFormat"',
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

    const bautaJS = new BautaJS(customFormatSchema as Document[], {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.validateResponse(true).setup(p =>
            p.push(() => {
              return expected;
            })
          );
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
      ]
    });

    await bautaJS.bootstrap();
    await expect(
      bautaJS.operations.v1.operation1.run({
        req: { query: {}, body: {} },
        res: {}
      })
    ).rejects.toThrow(
      expect.objectContaining({
        errors: [
          {
            path: '[0].tag',
            location: 'response',
            message: 'should match format "customTagFormat"',
            errorCode: 'format'
          }
        ]
      })
    );
  });
});
