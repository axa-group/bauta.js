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
import { defaultLogger } from '../default-logger';
import { createContext } from '../utils/create-context';

describe('create context tests', () => {
  test('should generate a request id', () => {
    const result = createContext({});
    expect(typeof result.id).toStrictEqual('string');
  });

  test('should propagate the request id', () => {
    const req = {
      id: '1234'
    };
    const result = createContext({ req, id: req.id });
    expect(result.id).toStrictEqual('1234');
  });

  test('should generate a logger', () => {
    const result = createContext({});
    expect(typeof result.log.info).toStrictEqual('function');
  });

  test('should use the logger passed by parameter', () => {
    const logger = defaultLogger('test-logger');
    logger.levels = { labels: { 1: 'test' }, values: { test: 1 } };
    const req = {
      id: '1234'
    };
    const result = createContext({ req, id: req.id, log: logger });
    expect(result.raw.log.levels).toStrictEqual(logger.levels);
  });

  test('should propagate custom properties', () => {
    const req = { test: 1 };
    const result = createContext({ req });
    expect(result.raw.req.test).toStrictEqual(1);
  });

  test('should propagate the data object', () => {
    const data = { test: 1 };
    const result = createContext({ data });
    expect(result.data.test).toStrictEqual(1);
  });
});
