const { resolver } = require('@axa/bautajs-core');

module.exports = resolver(operations => {
  operations.randomYear.validateResponse(false).setup(() => 'This is v2');
});
