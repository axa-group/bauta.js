# Context

A context is an object created by [endpoint execution](../packages/bautajs-core/src/types.ts#397).

## getRequest(ctx)

You can get the request of the low-level framework used (Express.js or Fastify) from the Bauta.js context.

```js
  const { getRequest } = require('@axa-group/bautajs-fastify');

  const stepHelper1 = step((_, ctx) => {
    const req = getRequest(ctx);

    ctx.logger.info('Show me my header value', req.headers.myHeader);
  });

  module.exports = {
    stepHelper1
  }
```

## getRsponse(ctx)

You can get the response of the low-level framework used (Express.js or Fastify) from the Bauta.js context.

```js
  const { getResponse } = require('@axa-group/bautajs-fastify');

  const stepHelper1 = step((_, ctx) => {
    const reply = getResponse(ctx);
    reply.header('myHeader', 'foo');
  });

  module.exports = {
    stepHelper1
  }
```

### Logging with Bauta.js context

The logger instance  is available on the context. Check the Bauta.js logger specifities on the [Bauta.js logging](./logging.md) documentation.

```js
  const { step } = require('@axa-group/bautajs-core');

  const stepHelper1 = step((value, ctx) => {
    ctx.logger.info('Some log for this session');
  });

  module.exports = {
    stepHelper1
  }
```

### Save data into the context

We recommend to avoid to store data in the context as far as possible to avoid possible side effects. In any case, if you need to do it, the Bauta.js context has property called `data` that is a free object where you can add your data and passed between Pipeline.StepFunctions.

```js
  const { step, pipe } = require('@axa-group/bautajs-core');

  const stepHelper1 = step((_, ctx) => {
    ctx.data.myData = 'foo';
  });

  const stepHelper2 = step((_, ctx) => {
   console.log('Print the previous data store into the context by stepHelper1', ctx.data.myData)
  });

  const myPipeline = pipe(stepHelper1, stepHelper2);

  module.exports = {
    myPipeline
  }
```
