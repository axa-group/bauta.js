const { pipe, resolver, step } = require('@axa/bautajs-core');

const getCatStep = step(() => {
  return {
    petName: 'Grey',
    communication: 'Meow',
    action: 'Purr'
  };
});

module.exports = resolver(operations => {
  operations.findCatV2.validateRequest(true).validateResponse(true).setup(pipe(getCatStep));
});
