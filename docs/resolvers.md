# Resolvers

The resolvers is where you specify the logic of every route/operation. A resolver can be an async function.

Bauta.js will automatically import all files with the `-resolver.js` name in it under the `resolvers` folder.  Alternatively, you can set a different glob path on the `Bauta.js` instace creation using the `resolverPath` property. If your resolvers are TypeScript modules, you must specify always the `resolverPath` on the initialization of the Bauta.js instance. Remember, the path must be to the compiled sources:

```js
// server.js
...

fastify.register(bautajsFastify, {
  apiDefinition,
  resolversPath: 'dist/*-resolver.js',
  apiBasePath: '/api'
});

...
```

```js
// resolvers/cats-resolver.ts
import { resolver } from '@axa/bautajs-core';

export default resolver((operations) => {
  operations.findCats.setup(() => {
      return {
        id: '1'
      }
    })
})
```

## Pipelines

Bauta.js provides a set of decorators to ease writing the logic of your endpoint's resolvers. One of the most interesting decorators is `pipe`. It allows to express the logic as a flow of data that follows a pipeline. It helps to separate the logic on small and reusable and testable functions called `steps`. A step function can be async.

A pipeline is a chain of `Pipeline.StepFunctions`.

```js
// resolvers/my-pipeline.js
const { pipe } = require('@axa/bautajs-core');

const findCatsPipeline = pipe(
  () => {
    return {
      id:'1'
    }
  },
  (val) => {
    return {
      ...val,
      name: 'supercat'
    }
  }
)

module.exports = {
  findCatsPipeline
};
```

### Composing pipelines

You can also merge pipelines or to add additional steps to any existing pipeline. It is the main mechanism to reuse and compose common logic in your different endpoints.

```js
// resolvers/my-pipeline.js
const { pipe } = require('@axa/bautajs-core');

const logResultPipeline = pipe((result) => {
    console.log(result);
    return result;
  });

const findCatsPipeline = pipe(() => {
    return {
      id:'1'
    }
  },
  (val) => {
    return {
      ...val,
      name: 'supercat'
    }
  },
  logResultPipeline
);

module.exports = {
  findCatsPipeline
};
```

### Handling errors

To handle errors and exception inside a Bauta.js pipeline you can use `catchError`.

```js
// resolvers/my-pipeline.js
const { pipe } = require('@axa/bautajs-core');

const logError = (err) => {
  console.error(err);
  return Promise.reject(err);
}

const findCatsPipeline = pipe(() => {
    return {
      id:'1'
    }
  },
  (val) => {
    return {
      ...val,
      name: 'supercat'
    }
  }).catchError(logError);

module.exports = {
  findCatsPipeline
};
```

### Pipeline as executable functions

```js
const { pipe } = require('@axa/bautajs-core');

const logResultPipeline = pipe((result) => {
    console.log(result);
    return result;
  });

const findCatsPipeline = pipe(
  (val, ctx, Bauta.js) => {

    logResultPipeline(val, ctx, Bauta.js);

    return {
      id:'1'
    }
  },
  (val) => {
    return {
      ...val,
      name: 'supercat'
    }
  });
```


## Step functions <Pipeline.StepFunction>

An `Pipeline.StepFunction` is the individual element that together compose the pipeline.

An `Pipeline.StepFunction` have three input parameters:

- The previous Pipeline.StepFunction value as first parameter. In the first Pipeline.StepFunction will be undefined.
- The pipeline [ctx](#Context), that is the context object that includes logger, id and data transmitted through all the pipeline.
- The Bauta.js instance, meaning you have access to the operations from the Pipeline.StepFunction.

It's recommended but not mandatory to wrap all the related Pipeline.StepFunction's using the 'step' decorator provided by `@axa/bautajs-core`.

```js
  // my-step-functions-helpers.js
  const { getRequest } = require('@axa/bautajs-express');
  const { step } = require('@axa/bautajs-core');

  const stepHelper1 = step((value, ctx) => {
    ctx.data.something = 'something';
  });

  const stepHelper2 = step((val, ctx) => {
    const req = getRequest(ctx);
    return {
      headers: req.headers,
      ....val
    }
  });

  module.exports = {
    stepHelper1,
    stepHelper2,
  }
```
