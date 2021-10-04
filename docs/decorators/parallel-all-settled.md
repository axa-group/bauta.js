# parallelAllSettled decorator

The 'parallelAllSettled' allows you to execute given Pipeline.StepFunctions in parallel. Under the hood it uses [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled). This decorator can be useful in the cases we don't want blocking requests and we want to return only the info that we need or we want to adapt behavior to the status of particular promise, however, we want to execute more than one in parallel. You can explore the source code [here](https://github.axa.com/Digital/bauta-nodejs/blob/master/packages/bautajs-core/src/decorators/parallel-all-settled.ts).

## Example usage

Please note, that this decorator will return array of objects contain fields depending on the promise status (`fulfilled` or `rejected`).
For fulfilled it will be `{status: 'fulfilled', value: 'some value here'}` and for rejected `{status: 'rejected', reason: 'Error object'}`

```javascript
const { parallelAllSettled, pipe, createContext, BautaJSInstance } = require('@batuajs/core');

const error = new Error('no pets here!');

const pipeline = pipe(
  parallelAllSettled(
    () => Promise.resolve({ id: 1, name: 'pet1' }),
    () => Promise.resolve({ id: 2, name: 'pet2' }),
    () => Promise.resolve({ id: 3, name: 'pet3' }),
    () => Promise.reject(error)
  )
);

await pipeline({}, createContext({}), {} as BautaJSInstance)

// => 
// [
//   { status: 'fulfilled', value: { id: 1, name: 'pet1' } },
//   { status: 'fulfilled', value: { id: 2, name: 'pet2' } },
//   { status: 'fulfilled', value: { id: 3, name: 'pet3' } },
//   { status: 'rejected', reason: Error: no pets here! }
// ];
```
