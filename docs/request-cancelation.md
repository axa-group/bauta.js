# Cancelable request

All the pipelines are cancelable promises that are attached to the `req.on('abort')` and to the `req.on('timeout')` [Node.js request events](https://nodejs.org/api/http.html#http_class_http_clientrequest).
When the client cancel the request the pipeline is canceled and the `onCancel` method is called for each pushed OperatorFunction.

- Example:
```js
// resolvers/my-resolver.js
const { resolver } = require('@bautajs/core');

module.exports = resolver((operations) => {
  operations.v1.findCats.setup((p) => {
    p.pipe((val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled');
        })
      return {
        id: '1'
      }
    },
    (val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled fired on cancel 2');
        })
      return {
        id: '1'
      }
    },
    (val, ctx) => {
      return {
        id: '1'
      }
    })
  });
})
```

In the example of above if the request is canceled before complete all OperatorFunctions, an error will be thrown and the pending OperatorFunctions won't be executed.

- In case of a request to a datasource, if a request is canceled, the request to the third party API will be discarded.

## Cancel the pipeline manually

```js
// resolvers/my-resolver.js
const { resolver } = require('@bautajs/core');

module.exports = resolver((operations) => {
  operations.v1.findCats.setup((p) => {
    p.pipe((val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled');
        })
      return {
        id: '1'
      }
    },
    (val, ctx) => {
        ctx.token.onCancel(() => {
            console.log('The request was canceled fired on cancel 2');
        })
      return {
        id: '1'
      }
    },
    (val, ctx) => {
      return {
        id: '1'
      }
    })
  });
})
```

```js
const { BautajsExpress } = require('@bautajs/express');
const myAPIDefinitions = require('./my-api-definitions.json');

const bautajs = new BautajsExpress(myAPIDefinitions);

const promise = bautajs.operations.v1.findCats.run();
// Cancelling the promise manually
promise.cancel();
```