/*
 * Copyright (c) AXA Shared Services Spain S.A.
 *
 * Licensed under the AXA Shared Services Spain S.A. License (the "License"); you
 * may not use this file except in compliance with the License.
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
const nock = require('nock');
const Service = require('../../../core/Service');
const flow = require('../../../decorators/flow');
const request = require('../../../decorators/request');
const [testApiDefinition] = require('../../fixtures/test-api-definitions.json');
const testDataource = require('../../fixtures/test-datasource.json');

describe('Flow decorator', () => {
  jest.useFakeTimers();
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

  test('Should execute the promises in serial passing it as a array', async () => {
    service.v1.operation1.push(flow([request(), result => [...result, { id: 1, name: 'pet' }]]));

    expect(await service.v1.operation1.exec({ id: 1 }, {})).toEqual([
      { id: 3, name: 'pet3' },
      { id: 1, name: 'pet' }
    ]);
  });

  test('Should execute the promises in serial passing it as a list of parameters', async () => {
    service.v1.operation1.push(
      flow(
        request(),
        result => [...result, { id: 1, name: 'pet' }]
      )
    );

    expect(await service.v1.operation1.exec({ id: 1 }, {})).toEqual([
      { id: 3, name: 'pet3' },
      { id: 1, name: 'pet' }
    ]);
  });
});
