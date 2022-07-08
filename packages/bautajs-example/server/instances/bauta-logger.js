const { BautaJSExpress } = require('@axa/bautajs-express');
const apiDefinition = require('../../api-definition.json');

const logger = require('./custom-logger-bauta')('bauta-logger');

module.exports = new BautaJSExpress({
  apiDefinition,
  resolversPath: './server/resolvers/**/*resolver.js',
  staticConfig: {
    someVar: 2
  },
  logger
});
