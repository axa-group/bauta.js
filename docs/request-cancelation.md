# Cancelable request

Every Bauta.js operations (endpoints) are listening to the following events: `req.on('abort')` and to the `req.on('timeout')` (See [Node.js request events](https://nodejs.org/api/http.html#http_class_http_clientrequest).

When any of those events are emitted, the operation is canceled and the `onCancel` method is called for each Pipeline.StepFunction that are currently in execution or it was already executed.

### Example

```js
// resolvers/my-resolver.js
const { resolver } = require('@axa-group/bautajs-core');

module.exports = resolver((operations) => {
  operations.findCats.setup(
    pipe(
      // First step function
      async function step1(val, ctx) {
        ctx.token.onCancel(() => {
          console.log('The request was canceled');
        })
        return {
          id: '1'
        }
    },
    // Second step function
    async function step2(val, ctx) {
        ctx.token.onCancel(() => {
            console.log('The request was canceled fired on cancel 2');
        })
        return {
          id: '1'
        }
    },
    // Last step function
    async function step3(val, ctx) {
      return {
        id: '1'
      }
    })
  );
})
```

In the previous example, if the operation `findCats` is canceled or aborted by the requester before all the Pipeline.StepFunctions are finished, an [error will be thrown](https://github.com/sindresorhus/p-cancelable#cancelerror) and the pending Pipeline.StepFunctions won't be executed. The error

If the request was canceled before the execution of the second Pipeline.StepFunctions, `step2`, only the first `ctx.token.onCancel()` function will be executed.

If one of the steps are a [dataSource](./docs/datasources.md) execution, the request to the third party API will be discarded also.

## Cancelling the pipeline programmaticaly

```js
// resolvers/my-resolver.js
const { resolver } = require('@axa-group/bautajs-core');

module.exports = resolver((operations) => {
  operations.findCats.setup(
    pipe(
      // First step function
      async (val, ctx) => {
        ctx.token.onCancel(() => {
          console.log('The request was canceled');
        })
        return {
          id: '1'
        }
    },
    // Second step function
    async (val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled fired on cancel 2');
        })
        return {
          id: '1'
        }
    },
    // Last step function
    async (val, ctx) => {
      return {
        id: '1'
      }
    })
  );
})
```

```js
const { BautajsExpress } = require('@axa-group/bautajs-express');
const myAPIDefinitions = require('./my-api-definitions.json');

const bautajs = new BautajsExpress(myAPIDefinitions);

const promise = bautajs.operations.findCats.run();
// Cancelling the promise manually
promise.cancel();
```
