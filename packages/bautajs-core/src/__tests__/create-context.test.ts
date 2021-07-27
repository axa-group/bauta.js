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

  test('should generate a logger by default', () => {
    const result = createContext({});
    expect(typeof result.log.info).toStrictEqual('function');
  });

  test('should use the child logger passed as raw data', () => {
    const logger = defaultLogger('test-logger');
    logger.levels = { labels: { 1: 'test' }, values: { test: 1 } };
    const req = {
      id: '1234'
    };
    const result = createContext({ req, id: req.id, log: logger });
    expect(result.raw.log.levels).toStrictEqual(logger.levels);
  });

  test('should create a child using the logger passed to the function', () => {
    const logger = defaultLogger('test-logger');
    const childLogger = jest.fn();
    logger.child = () => childLogger as any;
    const result = createContext({}, logger);
    expect(result.log).toStrictEqual(childLogger);
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

  test('should set the log child url and query params', () => {
    const logger = defaultLogger('test-logger');

    const spy = jest.spyOn(logger, 'child');
    createContext({ id: '1', url: '/path/to/url?test=1' }, logger);
    expect(spy).toHaveBeenCalledWith({
      query: { test: '1' },
      url: '/path/to/url',
      reqId: '1'
    });
  });

  test('should transform multiple query parameters in to an array', () => {
    const logger = defaultLogger('test-logger');

    const spy = jest.spyOn(logger, 'child');
    createContext({ id: '1', url: '/path/to/url?test=1&test=2&another=param' }, logger);
    expect(spy).toHaveBeenCalledWith({
      query: { test: ['1', '2'], another: 'param' },
      url: '/path/to/url',
      reqId: '1'
    });
  });
});
