import { resolver } from '@axa/bautajs-core';

export default resolver(operations => {
  operations.operation1.setup(() => [
    {
      id: 'patata', // The schema defines id as a number but here we put a string to force an schema validation error
      name: 'pet2'
    }
  ]);
});
