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
/* global expect, describe, test, jest, beforeEach, afterEach */
const Service = require('bautajs/core/Service');
const request = require('bautajs/decorators/request');
const nock = require('nock');
const cache = require('../index');
const [testApiDefinition] = require('./fixtures/test-api-definitions.json');
const testDataource = require('./fixtures/test-datasource.json');

describe('Cache push', () => {
  let service;
  beforeEach(() => {
    nock('https://google.com')
      .persist()
      .get('/')
      .reply(200, [{ id: 3, name: 'pet3' }]);

    service = new Service('testService', testDataource.services.testService, [
      { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v1' } },
      { ...testApiDefinition, info: { ...testApiDefinition.info, version: 'v2' } }
    ]);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('Should cache the requests with the same id', async () => {
    const fn = jest.fn(() => [{ id: 1, name: 'pet' }]);
    service.v1.operation1.push(
      cache([request(), result => ({ ...result, new: 1 }), fn], ([, ctx]) => ctx.id)
    );

    await service.v1.operation1.exec({ id: 1 }, {});
    await service.v1.operation1.exec({ id: 1 }, {});

    expect(fn.mock.calls.length).toBe(1);
  });

  test('Should allow memoizee options', done => {
    const fn = jest.fn(() => [{ id: 1, name: 'pet' }]);
    service.v1.operation1.push(
      cache([request(), result => ({ ...result, new: 1 }), fn], ([, ctx]) => ctx.id, {
        maxAge: 500
      })
    );

    service.v1.operation1
      .exec({ id: 1 }, {})
      .then(() => {
        setTimeout(() => {
          service.v1.operation1
            .exec({ id: 1 }, {})
            .then(() => {
              expect(fn.mock.calls.length).toBe(2);
              // Wait to expire again not left open setTimeout on test execution
              setTimeout(() => {
                done();
              }, 1000);
            })
            .catch(done);
        }, 1000);
      })
      .catch(done);
  });

  test('Should throw an error if normalizer function is not specified', async () => {
    const fn = jest.fn(() => [{ id: 1, name: 'pet' }]);
    expect(() =>
      service.v1.operation1.push(cache([request(), result => ({ ...result, new: 1 }), fn]))
    ).toThrowError(
      'normalizer: (args)=>{} function is a mandatory parameter to calculate the cache key'
    );
  });
});
