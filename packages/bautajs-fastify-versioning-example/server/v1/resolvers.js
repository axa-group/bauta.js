import { pipe, resolver, step } from '@axa/bautajs-core';

const getCatStep = step(() => {
  return {
    name: 'Grey',
    communication: 'Meow',
    breed: 'all cats are the same'
  };
});

const getDogStep = step(() => {
  return {
    name: 'Milu',
    communication: 'Woof',
    breed: 'fox-terrier'
  };
});

export default resolver(operations => {
  operations.findCat.validateRequest(true).validateResponse(true).setup(pipe(getCatStep));
  operations.findDog.validateRequest(true).validateResponse(true).setup(pipe(getDogStep));
});
