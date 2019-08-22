# Resolver

A resolver is a Node.js module where you define your operations OperatorFunctions, pipelines and behaviour. Basically is where resides all the logic of your API. 
`bautajs` will automatically import all files with the `-resolver.js` name in it under the `resolvers` folder alternative you can pass the resolvers as a parameter on the `bautajs`creation.

```js
// resolvers/my-resolver.js
const { resolver } = require('@bautajs/core');

module.exports = resolver((operations) => {
  operations.v1.findCats.setup((p) => {
    p.pipe(() => {
      return {
        id: '1'
      }
    })
  });
})
```

Remember you only can access to the operation you have defined on the your OpenAPI file.

`You can define the resolver without wrap it into the resolver function, resolver function only gives you intellisense`

# Pipeline

A pipeline is an chain of OperatorFunctions for the given operation.

```js
// resolvers/my-pipeline.js
const { pipelineBuilder } = require('@bautajs/core');

const findCatsPipeline = pipelineBuilder((p) => {
  p.pipe(
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
  })
})

module.exports = {
  findCatsPipeline
};
```

- You can also merge pipelines.

```js
// resolvers/my-pipeline.js
const { pipelineBuilder } = require('@bautajs/core');

const logResultPipeline = pipelineBuilder((p) => {
  p.pipe((res) => {
    console.log(res);
    return res;
  })
});

const findCatsPipeline = pipelineBuilder((p) => {
  p.pipe(() => {
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
  )
});

module.exports = {
  findCatsPipeline
};
```

- And control your pipeline errors.

```js
// resolvers/my-pipeline.js
const { pipelineBuilder } = require('@bautajs/core');

const logError = (err) => {
  console.error(err);
  return Promise.reject(err);
}

const findCatsPipeline = pipelineBuilder((p) => {
  p.pipe(() => {
    return {
      id:'1'
    }
  },
  (val) => {
    return {
      ...val,
      name: 'supercat'
    }
  })
  .onError(logError)
});

module.exports = {
  findCatsPipeline
};
```

- Pipeline are executable as well.

```js
const { pipelineBuilder } = require('@bautajs/core');

const logResultPipeline = pipelineBuilder((p) => {
  p.pipe((res) => {
    console.log(res);
    return res;
  })
});

const findCatsPipeline = pipelineBuilder((p) => {
  p.pipe(
  async (val, ctx, bautajs) => {

    await logResultPipeline.run(val, ctx, bautajs);

    return {
      id:'1'
    }
  },
  (val) => {
    return {
      ...val,
      name: 'supercat'
    }
  })
});
```

- Pipeline can be executed by a condition.


```js
const { pipelineBuilder, match } = require('@bautajs/core');
const { bautajsInstance } = require('./bautajs-instance');

const logResultPipeline = pipelineBuilder((p) => {
  p.pipe((res) => {
    console.log(res);
    return res;
  })
});

const findCatsPipeline = pipelineBuilder((p) => {
  p.pipe(
  async (val, ctx, bautajs) => {
    return {
      id:'1'
    }
  },
  (val) => {
    return {
      ...val,
      name: 'supercat'
    }
  })
});

bautajsInstance.operations.v1.findcats.setup(
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

# OperatorFunction

An OperatorFunction is an implementation of a part of a pipeline.

An OperatorFunction have three input parameters:
  - The previous OperatorFunction value as first parameter. In the first OperatorFunction will be undefined.
  - The request [ctx](#Context), that is the context object that includes the request and response.
  - The bautajs instance, meaning you have access to the operations from the OperatorFunction.

my-operator-functions-helpers.js
```js

  const operatorHelper1 = (value, ctx) => {
    ctx.data.something = 'something';
  };

  const operatorHelper2 = (val, ctx) => {
    return {
      headers: ctx.req.headers,
      ....val
    }
  };

  module.exports = {
    operatorHelper1,
    operatorHelper2,
  }
```

# Context

A context is an unique object by request that contains the unique data by request. This data might have the req and the res objects of the framework (express, fastify...) depending on which module is being used. See [Context interface](../packages/bautajs/src/utils/types.ts) for more informatin about the available properties.

### Loggin with request context

Inside the ctx object a logger function resides, using this loggin will help you to identify logs from same request/sessions.

```js
  const operatorHelper1 = (value, ctx) => {
    ctx.logger.info('Some log for this session');
  };

  module.exports = {
    operatorHelper1,
  }
```

### Save data into the context

We strongly recommend to not save data into the ctx directly, for that pruposes the context has an special property called `data` that is a free object where you can add your data and passed between OperatorFunctions.

```js
  const operatorHelper1 = (value, ctx) => {
    ctx.data.customData = {
      id:'1'
    }
  };

  module.exports = {
    operatorHelper1,
  }
```