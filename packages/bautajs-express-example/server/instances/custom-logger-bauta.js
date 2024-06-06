import pino from 'pino';

function getLogger(moduleName) {
  const config = {
    level: 'debug',
    name: moduleName,
    transport: {
      target: 'pino-pretty'
    }
  };

  return pino(config);
}

export default getLogger;
