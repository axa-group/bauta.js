const { resolver } = require('@axa/bautajs-core');

module.exports = resolver(operations => {
  operations.operation1.setup(() => [
    {
      id: 'patata', // The schema defines id as a number but here we put a string to force an schema validation error
      name: 'pet2'
    }
  ]);
});
