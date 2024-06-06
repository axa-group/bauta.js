import { resolver } from '@axa/bautajs-core';

export default resolver(operations => {
  operations.operation1.setAsPrivate(true).setup(() => [
    {
      id: 134,
      name: 'pet2'
    }
  ]);
});
