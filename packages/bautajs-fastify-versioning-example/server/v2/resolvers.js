import { pipe, resolver, step } from '@axa/bautajs-core';

const getCatStep = step(() => {
  return {
    petName: 'Blondie',
    communication: 'Meow',
    favouriteAction: 'Purr'
  };
});

export default resolver(operations => {
  operations.findCatV2
    .validateRequest(true)
    .validateResponse(true)
    .setup(
      pipe(getCatStep, prev => {
        console.log('mierda mia', prev);
        return prev;
      })
    );
});
