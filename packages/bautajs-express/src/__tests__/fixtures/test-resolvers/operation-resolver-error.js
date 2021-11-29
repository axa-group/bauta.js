const { resolver } = require('@axa/bautajs-core');

module.exports = resolver(operations => {
  operations.operation1.setup(() => Promise.reject(new Error('some error')));
});
