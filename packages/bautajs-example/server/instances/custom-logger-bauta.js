const pino = require('pino');

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

module.exports = getLogger;
