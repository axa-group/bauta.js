const { resolver } = require('@axa/bautajs-core');
const { catsRestProviderWithHttps } = require('../datasources/cats-datasource');

module.exports = resolver(operations => {
  operations.cats.validateRequest(false).validateResponse(false).setup(catsRestProviderWithHttps());
});
