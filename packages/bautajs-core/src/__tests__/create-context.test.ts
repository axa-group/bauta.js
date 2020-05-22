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
import { createContext } from '../utils/create-context';
import { defaultLogger } from '../default-logger';

describe('create context tests', () => {
  let logger;
  beforeAll(() => {
    logger = defaultLogger('test-logger');
  });
  test('should return the request id and logger', () => {
    const req = { headers: {} };
    const result = createContext({ req }, logger, '1');
    expect(typeof result.id).toStrictEqual('string');
    expect(typeof result.logger.info).toStrictEqual('function');
  });

  test('should use the request-id header in case that exists as req.id', () => {
    const req = {
      headers: {
        authorization: 'Bearer aaabbbccc',
        'x-request-id': '1234'
      }
    };
    const result = createContext({ req }, logger, '1');
    expect(result.id).toStrictEqual('1234');
  });
});
