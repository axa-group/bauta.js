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
// eslint-disable-next-line no-unused-vars

import supertest from 'supertest';
import { resolver } from '@bautajs/core';
import { BautaJSExpress } from '../index';

const apiDefinitions = require('./fixtures/test-api-unused-definitions.json');
const expectedFullSwagger = require('./fixtures/expected-api-full-unused-swagger.json');
const expectedUnusedSwagger = require('./fixtures/expected-api-unused-swagger.json');

describe('express explorer', () => {
  test('should exposes all endpoints that has a resolver', async () => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.setup(p =>
            p.push(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ])
          );
          operations.v1.unused.setup(p =>
            p.push(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ])
          );
        })
      ]
    });

    await bautajs.applyMiddlewares();

    const res = await supertest(bautajs.app)
      .get('/v1/openapi.json')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200);

    expect(JSON.parse(res.text)).toStrictEqual(expectedFullSwagger);
  });

  test('should not expose the endpoint if there is no resolver for it', async () => {
    const bautajs = new BautaJSExpress(apiDefinitions, {
      resolvers: [
        resolver(operations => {
          operations.v1.operation1.setup(p =>
            p.push(() => [
              {
                id: 134,
                name: 'pet2'
              }
            ])
          );
        })
      ]
    });

    await bautajs.applyMiddlewares();

    const res = await supertest(bautajs.app)
      .get('/v1/openapi.json')
      .expect('Content-Type', 'text/html; charset=utf-8')
      .expect(200);

    expect(JSON.parse(res.text)).toStrictEqual(expectedUnusedSwagger);
  });
});
