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
import { sessionFactory } from '../session-factory';

describe('session factory tests', () => {
  test('should return the request id and logger', () => {
    const req = { headers: {} };
    const result = sessionFactory(req);
    expect(typeof result.id).toStrictEqual('string');
    expect(typeof result.logger.info).toStrictEqual('function');
  });

  test('should return the request id, the logger and the userId with the user token encripted in case of an Authenticated request', () => {
    const req = {
      headers: {
        authorization: 'Bearer aaabbbccc'
      }
    };
    const result = sessionFactory(req);
    expect(typeof result.userId).toStrictEqual('string');
  });

  test('should use the request-id header in case that exists as req.id', () => {
    const req = {
      headers: {
        authorization: 'Bearer aaabbbccc',
        'request-id': '1234'
      }
    };
    const result = sessionFactory(req);
    expect(result.id).toStrictEqual('1234');
  });
});
