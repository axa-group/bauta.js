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
import pino from 'pino';
import { BautaJS } from '../index';
import { Document, Logger } from '../types';
import { defaultLogger } from '../default-logger';
import testApiDefinitionsJson from './fixtures/test-api-definitions.json';

const validLevels = ['trace', 'info', 'error', 'debug', 'fatal', 'warn'];
const message = 'This is a general message';

describe('core tests', () => {
  describe('logger initialization tests', () => {
    test('should initialize with an usable default default', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config
      });
      await bautaJS.bootstrap();

      const { logger } = bautaJS;

      expect(logger).toBeDefined();

      validLevels.forEach((level: any) => {
        const spy = jest.spyOn(logger, level);
        logger[level](message);
        expect(spy).toHaveBeenCalledWith(message);
      });
    });

    test('should not initialize the core if using an invalid logger', async () => {
      const invalidLogger = defaultLogger();
      delete invalidLogger.info; // A custom made logger with no info is considered invalid

      const config = {
        endpoint: 'http://google.es'
      };
      expect(
        () =>
          new BautaJS(testApiDefinitionsJson as Document[], {
            staticConfig: config,
            logger: invalidLogger
          })
      ).toThrow(
        expect.objectContaining({
          message:
            'Logger is not valid. Must be compliant with basic logging levels(trace, debug, info, warn, error, fatal)'
        })
      );
    });

    test('should initialize the core if using a valid custom logger', async () => {
      const configLogger = {
        level: 'debug',
        name: 'logger-custom-test',
        prettyPrint: false
      };

      const validLogger = (pino(configLogger, pino.destination(1)) as unknown) as Logger;

      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config,
        logger: validLogger
      });

      await bautaJS.bootstrap();

      const { logger } = bautaJS;

      expect(logger).toBeDefined();

      validLevels.forEach((level: any) => {
        const spy = jest.spyOn(logger, level);
        logger[level](message);
        expect(spy).toHaveBeenCalledWith(message);
      });
    });

    test('should initialize the core if using a valid custom logger with extra log levels', async () => {
      const configLogger = {
        level: 'debug',
        name: 'logger-custom-test',
        prettyPrint: false,
        customLevels: {
          always: 110 // Even if log.levelVal = 100 is set, always still gets printed
        }
      };

      const validLogger = pino(configLogger, pino.destination(1));

      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS(testApiDefinitionsJson as Document[], {
        staticConfig: config,
        logger: validLogger
      });

      await bautaJS.bootstrap();

      const { logger } = bautaJS;

      expect(logger).toBeDefined();

      const customValidLevels = [...validLevels, 'always'];

      customValidLevels.forEach((level: any) => {
        const spy = jest.spyOn(logger, level);
        logger[level](message);
        expect(spy).toHaveBeenCalledWith(message);
      });
    });
  });
});
