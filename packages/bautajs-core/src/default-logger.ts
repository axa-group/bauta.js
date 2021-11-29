import pino from 'pino';

const DEFAULT_LOGGER_NAME = 'bautajs';

export function defaultLogger(namespace = DEFAULT_LOGGER_NAME) {
  return pino({
    level: process.env.LOG_LEVEL || 'error',
    name: namespace
  });
}

export default defaultLogger;
