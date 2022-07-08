const { resolver } = require('@axa/bautajs-core');

module.exports = resolver(operations => {
  operations.operation1.setAsPrivate(true).setup(() => [
    {
      id: 134,
      name: 'pet2'
    }
  ]);
});
