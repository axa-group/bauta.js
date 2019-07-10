# Resolver

A resolver is a file where you define your services operations steps, pipelines and behaviour. Basically is where resides all the logic of your API. 
`bautajs` will automatically import all files with the `-resolver.js` name in it under the `services` foolder.

```js
// services/my-resolver.js
const { resolver } = require('@bautajs/express');

module.exports = resolver((services) => {
  services.v1.cat.find.setup((p) => {
    p.push(() => {
      return {
        id: '1'
      }
    })
  });
})
```

Remember you only can access to the services and operation you have defined on the [datasource](./datasources.md)

`You can define the resolver without wrapp it into the resolver function, resolver function only gives you intellisence`

# Pipeline

A pipeline is an chain of steps for the given operation.

```js
// services/my-pipeline.js
const { pipeline } = require('@bautajs/express');

const findCatsPipeline = pipeline((p) => {
  p.push(() => {
    return {
      id:'1'
    }
  })
  .push((val) => {
    return {
      ...val,
      name: 'supercat'
    }
  })
})

module.exports = {
  findCatsPipeline
};
```

# Step

An step is an implementation of a part of a pipeline.

An step have three input parameters:
  - The previous step value as first parameter. In the first step will be undefined.
  - The pipeline [ctx](#Context).
  - The bautajs instance, meaning you have access to the services from the step.

my-step-helpers.js
```js
  const { step } = require('@bautajs/express')

  const stepHelper1 = step((value, ctx) => {
    ctx.data.something = 'something';
  });

  const stepHelper2 = step((val, ctx) => {
    return {
      headers: ctx.req.headers,
      ....val
    }
  });

  module.exports = {
    stepHelper1,
    stepHelper2,
  }
```

# Context

A context is an unique object by request that contains the unique data by request. This data might have the req and the res objects of the framework (express, fastify...) depending on which module is being used. See [Context interface](../packages/bautajs/src/utils/types.ts) for more informatin about the available properties.

### Loggin with request context

Inside the ctx object a logger function resides, using this loggin will help you to identify logs from same request/sessions.

```js
  const { step } = require('@bautajs/express')

  const stepHelper1 = step((value, ctx) => {
    ctx.logger.info('Some log for this session');
  });

  module.exports = {
    stepHelper1,
  }
```

### Save data into the context

We strongly recommend to not save data into the ctx directly, for that pruposes the context has an special property called `data` that is a free object where you can add your data and passed between steps.

```js
  const { step } = require('@bautajs/express')

  const stepHelper1 = step((value, ctx) => {
    ctx.data.customData = {
      id:'1'
    }
  });

  module.exports = {
    stepHelper1,
  }
```