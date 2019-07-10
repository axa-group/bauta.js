const { BautaJSExpress } = require('@bautajs/express');
const apiDefinition = require('../../api-definition.json');

module.exports = new BautaJSExpress(apiDefinition, {
  dataSourcesPath: './server/services/**/*datasource.?(js|json)',
  resolversPath: './server/services/**/*resolver.js',
  dataSourceStatic: {
    someVar: 2
  }
});
