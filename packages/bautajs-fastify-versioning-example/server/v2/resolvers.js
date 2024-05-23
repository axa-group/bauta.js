const { pipe, resolver, step } = require('@axa/bautajs-core');

const getCatStep = step(() => {
  return {
    petName: 'Blondie',
    communication: 'Meow',
    favouriteAction: 'Purr'
  };
});

module.exports = resolver(operations => {
  operations.findCatV2.validateRequest(true).validateResponse(true).setup(pipe(getCatStep));
  // operations.findCat.validateRequest(true).validateResponse(true).setup(pipe(getCatStep));
});
