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
import { BautaJS, resolver } from '../index';
import { Document } from '../utils/types';
import circularSchema from './fixtures/circular-schema.json';
import formatSchema from './fixtures/schema-with-format.json';

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
        id: ['123'],
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
        id: ['123'],
        name: 'pet',
        pets: [
          {
            id: 1234.4,
            name: 'pet child'
          }
        ]
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

  test('should validate a schema with not valid formats', async () => {
    const config = {
      endpoint: 'http://google.es'
    };
    const expected = [
      {
        id: ['123'],
        name: 'pet',
        pets: [
          {
            id: 1234,
            name: 'pet child'
          }
        ]
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
});
