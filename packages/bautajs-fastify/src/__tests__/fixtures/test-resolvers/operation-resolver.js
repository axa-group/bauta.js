const { resolver } = require('@axa/bautajs-core');

module.exports = resolver(operations => {
  operations.operation1.setup(() => [
    {
      id: 134,
      name: 'pet2'
    }
  ]);
});
