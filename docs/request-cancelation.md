# Cancelable request

All the pipelines that contains some "async" operation in one of the steps are cancelable promises that are normally, attached to the `req.on('abort')` and to the `req.on('timeout')` [Node.js request events](https://nodejs.org/api/http.html#http_class_http_clientrequest) on [@bautajs/express](../packages/bautajs-express) or [@bautajs/fastify](../packages/bautajs-fastify) plugins.
When a cancel event is triggered outside the pipeline scope, the pipeline is canceled and the `onCancel` method is called for each Pipeline.StepFunction that was already executed.

- Example:
```js
// resolvers/my-resolver.js
const { resolver } = require('@bautajs/core');

module.exports = resolver((operations) => {
  operations.findCats.setup(pipe(async (val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled');
        })
      return {
        id: '1'
      }
    },
    async (val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled fired on cancel 2');
        })
      return {
        id: '1'
      }
    },
    async (val, ctx) => {
      return {
        id: '1'
      }
    })
  );
})
```

In the example of above if the request is canceled before complete all Pipeline.StepFunctions, an error will be thrown and the pending Pipeline.StepFunctions won't be executed.

- In case of a request to a provider, if a request is canceled, the request to the third party API will be discarded.
- Notice that cancel a pipeline is not possible for pipelines that do not contain an async operation.

## Cancel the pipeline manually

```js
// resolvers/my-resolver.js
const { resolver } = require('@bautajs/core');

module.exports = resolver((operations) => {
  operations.findCats.setup(pipe(
    async (val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled');
        })
      return {
        id: '1'
      }
    },
    async (val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled fired on cancel 2');
        })
      return {
        id: '1'
      }
    },
    async (val, ctx) => {
      return {
        id: '1'
      }
    })
  );
})
```

```js
const { BautajsExpress } = require('@bautajs/express');
const myAPIDefinitions = require('./my-api-definitions.json');

const bautajs = new BautajsExpress(myAPIDefinitions);

const promise = bautajs.operations.findCats.run();
// Cancelling the promise manually
promise.cancel();
```