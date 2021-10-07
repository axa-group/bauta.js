# Resolver

A resolver is a Node.js module where you define your operations Pipeline.StepFunctions, pipelines and behaviour. Basically is where resides all the logic of your API. 
`bautajs` will automatically import all files with the `-resolver.js` name in it under the `resolvers` folder alternative you can pass the resolvers as a parameter on the `bautajs`creation.

```js
// resolvers/my-resolver.js
const { resolver } = require('@bautajs/core');

module.exports = resolver((operations) => {
  operations.findCats.setup(() => {
      return {
        id: '1'
      }
    })
})
```

You can also specify resolvers directly on the bautajs.operations instance **before bootstrap the instance**.

`You can define the resolver without wrap it into the resolver function, resolver function only gives you intellisense`

**Resolvers imported automatically or specified with the parameter `resolversPath` must be javascript files in case that you are using typescript, the resolvers path should be pointing to the `dist` directory**

# Pipeline

A pipeline is a chain of Pipeline.StepFunctions.

```js
// resolvers/my-pipeline.js
const { pipe } = require('@bautajs/core');

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

- You can also merge pipelines.

```js
// resolvers/my-pipeline.js
const { pipe } = require('@bautajs/core');

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

- And control your pipeline errors.

```js
// resolvers/my-pipeline.js
const { pipe } = require('@bautajs/core');

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

- Pipeline are executable as well.

```js
const { pipe } = require('@bautajs/core');

const logResultPipeline = pipe((result) => {
    console.log(result);
    return result;
  });

const findCatsPipeline = pipe(
  (val, ctx, bautajs) => {

    logResultPipeline(val, ctx, bautajs);

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

- Pipeline can be executed by a condition.


```js
const { pipe, match } = require('@bautajs/core');
const { bautajsInstance } = require('./bautajs-instance');

const logResultPipeline = pipe((result) => {
    console.log(result);
    return result;
  });

const findCatsPipeline = pipe(
  (val, ctx, bautajs) => {
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

bautajsInstance.operations.findcats.setup(
  p =>
    p.pipe(
      () => 1,
      match(m => 
        m.on((prev) => prev === 1, findCatsPipeline)
        .otherwise(logResultPipeline)
      )
    )
)
```

# Pipeline.StepFunction

An Pipeline.StepFunction is the individual element that together compose the pipeline. A pipeline is composed of Pipeline.StepFunction that are executed "step" by "step".

An Pipeline.StepFunction have three input parameters:
  - The previous Pipeline.StepFunction value as first parameter. In the first Pipeline.StepFunction will be undefined.
  - The pipeline [ctx](#Context), that is the context object that includes logger, id and data transmitted through all the pipeline.
  - The bautajs instance, meaning you have access to the operations from the Pipeline.StepFunction.

It's recommended but not mandatory to wrap all the related Pipeline.StepFunction's using the 'step' decorator provided by `@bautajs/core`.

my-step-functions-helpers.js
```js
  const { getRequest } = require('@bautajs/express');
  const { step } = require('@bautajs/core');

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

# Context

A context is an unique object by [pipeline execution](../packages/bautajs-core/src/utils/types.ts#L457) that contains unique data. See [Context interface](../packages/bautajs-core/src/utils/types.ts#L258) for more information about the available properties.

### Logging with pipeline context

Inside the ctx object a logger function resides, using this logging will help you to identify logs from same pipeline execution.

```js
  const { step } = require('@bautajs/core');
  const stepHelper1 = step((value, ctx) => {
    ctx.logger.info('Some log for this session');
  });

  module.exports = {
    stepHelper1,
  }
```

### Save data into the context

We strongly recommend to not save data into the ctx directly, for that purposes the context has an special property called `data` that is a free object where you can add your data and passed between Pipeline.StepFunctions.

```js
  const { step } = require('@bautajs/core');
  const stepHelper1 = step((value, ctx) => {
    ctx.data.customData = {
      id:'1'
    }
  });

  module.exports = {
    stepHelper1,
  }
```

### Get request and response from context

Since the request and response objects are specific from the framework used on the project, those parameters can only be get it using the `getRequest` and `getResponse` helper methods from the specific framework.

For example, in case of the usage of `@bautajs/fastify` you can use both methods as follow:

```js
  const { step } = require('@bautajs/core');
  const { getRequest, getResponse } = require('@bautajs/fastify');
  const stepHelper1 = step((value, ctx) => {
    const req = getRequest(ctx);
    const res = getResponse(ctx);

    res.setStatus(200);

    return {
      param1: req.params.param1
    }
  });

  module.exports = {
    stepHelper1,
  }
```