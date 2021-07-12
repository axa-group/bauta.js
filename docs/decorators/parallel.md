# parallel operator

The `parallel` decorator allows you to execute given Pipeline.StepFunctions in parallel. Under the hood it uses [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all), which means that

> This returned promise will resolve when all of the input's promises have resolved, or if the input iterable contains no promises.
> It rejects immediately upon any of the input promises rejecting or non-promises throwing an error,
> and will reject with this first rejection message / error.

If your use case involves further execution depending on each of provided promises status or you don't want blocking requests you can use [parallelAllSettled](./parallelSettled.md) operator.

You can explore the source code [here](https://github.axa.com/Digital/bauta-nodejs/blob/master/packages/bautajs-core/src/operators/parallel.ts).

## Example

```javascript
const { parallel, pipe, createContext, BautaJSInstance } = require('@batuajs/core');

const getCats = () => {
  console.log('Cats are taking over the world!')
}

const pipeline = pipe(
  parallel(
    getCats(),
    getCats()
  )
);

await pipeline({}, createContext({}), {} as BautaJSInstance)

// => ['Cats are taking over the world!', 'Cats are taking over the world!']
```
