/* eslint-disable @typescript-eslint/ban-types */
import pino from 'pino';
import { BautaJS } from '../src/index';
import { Logger } from '../src/types';
import { defaultLogger } from '../src/default-logger';

const validLevels = ['trace', 'info', 'error', 'debug', 'fatal', 'warn'];
const message = 'This is a general message';

describe('core tests', () => {
  describe('logger initialization tests', () => {
    test('should initialize with an usable default default', async () => {
      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        staticConfig: config
      });
      await bautaJS.bootstrap();

      const { logger } = bautaJS;

      expect(logger).toBeDefined();

      validLevels.forEach((level: any) => {
        const spy = jest.spyOn(logger, level);
        (logger[level as keyof Logger] as Function)(message);
        expect(spy).toHaveBeenCalledWith(message);
      });
    });

    test('should not initialize the core if using an invalid logger', async () => {
      const invalidLogger = defaultLogger();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete invalidLogger.info; // A custom made logger with no info is considered invalid

      const config = {
        endpoint: 'http://google.es'
      };
      expect(
        () =>
          new BautaJS({
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
        name: 'logger-custom-test'
      };

      const validLogger = pino(configLogger);

      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        staticConfig: config,
        logger: validLogger
      });

      await bautaJS.bootstrap();

      const { logger } = bautaJS;

      expect(logger).toBeDefined();

      validLevels.forEach((level: any) => {
        const spy = jest.spyOn(logger, level);
        (logger[level as keyof Logger] as Function)(message);
        expect(spy).toHaveBeenCalledWith(message);
      });
    });

    test('should initialize the core if using a valid custom logger with extra log levels', async () => {
      const configLogger = {
        level: 'debug',
        name: 'logger-custom-test',
        customLevels: {
          always: 110 // Even if log.levelVal = 100 is set, always still gets printed
        }
      };

      const validLogger = pino(configLogger);

      const config = {
        endpoint: 'http://google.es'
      };

      const bautaJS = new BautaJS({
        staticConfig: config,
        logger: validLogger
      });

      await bautaJS.bootstrap();

      const { logger } = bautaJS;

      expect(logger).toBeDefined();

      const customValidLevels = [...validLevels, 'always'];

      customValidLevels.forEach((level: any) => {
        const spy = jest.spyOn(logger, level);
        (logger[level as keyof Logger] as Function)(message);
        expect(spy).toHaveBeenCalledWith(message);
      });
    });
  });
});
