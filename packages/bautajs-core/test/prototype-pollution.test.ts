import { BautaJS, resolver } from '../src/index';
import Parser from '../src/open-api/parser';
import { Document, OpenAPIV2Document, OpenAPIV3Document } from '../src/types';

describe('prototype pollution protections', () => {
  test('should keep __proto__ parameter names as own properties in OpenAPI v2 definitions', async () => {
    const specification = {
      swagger: '2.0',
      info: {
        title: 'test',
        version: '1.0.0'
      },
      paths: {
        '/test': {
          get: {
            operationId: 'operation1',
            parameters: [
              {
                in: 'query',
                name: '__proto__',
                type: 'string'
              }
            ],
            responses: {
              200: {
                description: 'ok'
              }
            }
          }
        }
      }
    };
    const parser = new Parser(new BautaJS({}).logger);
    const document = await parser.asyncParse(specification as OpenAPIV2Document);
    const properties = document.routes[0].schema.querystring?.properties;

    expect(Object.prototype.hasOwnProperty.call(properties, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(properties)).toBe(Object.prototype);
  });

  test('should keep __proto__ parameter names as own properties in OpenAPI v3 definitions', async () => {
    const specification = {
      openapi: '3.0.0',
      info: {
        title: 'test',
        version: '1.0.0'
      },
      paths: {
        '/test': {
          get: {
            operationId: 'operation1',
            parameters: [
              {
                in: 'query',
                name: '__proto__',
                required: true,
                schema: {
                  type: 'string'
                }
              }
            ],
            responses: {
              200: {
                description: 'ok'
              }
            }
          }
        }
      }
    };
    const parser = new Parser(new BautaJS({}).logger);
    const document = await parser.asyncParse(specification as OpenAPIV3Document);
    const properties = document.routes[0].schema.querystring?.properties;

    expect(Object.prototype.hasOwnProperty.call(properties, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(properties)).toBe(Object.prototype);
  });

  test('should keep __proto__ operation ids as own properties after bootstrap', async () => {
    const specification = {
      openapi: '3.0.0',
      info: {
        title: 'test',
        version: '1.0.0'
      },
      paths: {
        '/test': {
          get: {
            operationId: '__proto__',
            responses: {
              200: {
                description: 'ok'
              }
            }
          }
        }
      }
    };
    const bautaJS = new BautaJS({
      apiDefinition: specification as Document,
      resolvers: [
        resolver(operations => {
          Reflect.get(operations, '__proto__')
            .validateResponse(false)
            .setup(() => 'ok');
        })
      ]
    });

    await bautaJS.bootstrap();

    expect(Object.prototype.hasOwnProperty.call(bautaJS.operations, '__proto__')).toBe(true);
    expect(Object.getPrototypeOf(bautaJS.operations)).toBe(Object.prototype);
    await expect(
      Reflect.get(bautaJS.operations, '__proto__').run({ req: {}, res: {} })
    ).resolves.toBe('ok');
  });
});
