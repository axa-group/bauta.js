const { BautaJSExpress } = require('../../../dist/index');
const apiDefinition = require('../../api-definition.json');

module.exports = new BautaJSExpress(apiDefinition, {
  dataSourcesPath: './examples/server/services/**/*datasource.?(js|json)',
  resolversPath: './examples/server/services/**/*resolver.js',
  dataSourceCtx: {
    someVar: 2
  }
});
