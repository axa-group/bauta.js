const pino = require('pino');

function getLogger(moduleName) {
  const config = {
    level: 'debug',
    name: moduleName,
    prettyPrint: false
  };

  const logger = pino(config, pino.destination(1));

  return logger;
}

module.exports = getLogger;
