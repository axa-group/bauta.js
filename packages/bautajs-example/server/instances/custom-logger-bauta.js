const pino = require('pino');

function getLogger(moduleName) {
  const config = {
    level: 'debug',
    name: moduleName,
    prettyPrint: false
  };

  return pino(config, pino.destination(1));
}

module.exports = getLogger;
