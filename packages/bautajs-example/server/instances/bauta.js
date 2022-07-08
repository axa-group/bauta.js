const { BautaJSExpress } = require('@axa/bautajs-express');
const apiDefinition = require('../../api-definition.json');

module.exports = new BautaJSExpress({
  apiDefinition,
  resolversPath: './server/resolvers/**/*resolver.js',
  staticConfig: {
    someVar: 2
  }
});
