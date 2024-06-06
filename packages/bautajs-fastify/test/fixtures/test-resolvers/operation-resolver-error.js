import { resolver } from '@axa/bautajs-core';

export default resolver(operations => {
  operations.operation1.setup(() => Promise.reject(new Error('some error')));
});
