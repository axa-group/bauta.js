# Migration Guide from 3.x.x to 4.x.x

### bautajs-core

#### Pipelines

All pipeline system has been refactored into a more optimal and readable way.

Before:

```js
  const { pipelineBuilder } = require('@bautajs/core');

    const pp = pipelineBuilder(p =>
      p.pipe((_, ctx) => {
          return ctx.data.value;
        },
        value => ({ a: '123', b: value }),
        result => ({ ...result, new: 1 })
      )
    );
```

After:


```js
  const { pipe } = require('@bautajs/core');

    const pp = pipe((_, ctx) => {
          return ctx.data.value;
        },
        value => ({ a: '123', b: value }),
        result => ({ ...result, new: 1 })
      )
```

Also the error handler of a pipeline changed to allow error handler in the new pipeline format

Before:

```js
  const { pipelineBuilder } = require('@bautajs/core');

    const pipeline1 = pipelineBuilder(p =>
      p.pipe((_, ctx) => {
          return ctx.data.value;
        },
        value => ({ a: '123', b: value }),
        result => {
          if(result.a === '123') {
            throw new Error('result can not be 123 but is not bloking');
          }
          return result;
        },
      ).onError(err => {
        console.error(err);
        throw error;
      })
    );

    const pipeline2 = pipelineBuilder(p =>
      p.pipe(
        pipeline1,
        (_, ctx) => {
          if(ctx.data.someBlockingError) {
			      throw new Error('hey some blocking error');
          }
        }
      ).onError(err => {
        console.error(err);
        return {};
      })
    );
```

After:

```js
 const { pipe } = require('@bautajs/core');

    const pp1 = pipe((_, ctx) => {
          return ctx.data.value;
        },
        value => ({ a: '123', b: value }),
        result => {
          if(result.a === '123') {
            throw new Error('result can not be 123 but is not blocking');
          }
          return result;
        }).catchError(err => {
          console.error(err);
          return {};
        });
  const pp2 = pipe(
        pp1
        (_, ctx) => {
          if(ctx.data.someBlockingError) {
			      throw new Error('hey some blocking error');
          }
        }
      ).catchError(err => {
          console.error(err);
          throw err;
      });
```

### Context

In an effort to split responsibilities all records to .req and .res has been removed from the pipeline context. Since `bautajs` can be used with different frameworks such `express` or `fastify` the core package should not know anything about request or response object, that must be added by the correspondent framework plugin.

A "pipeline" context is now built with static fields not allowing "additional properties" forcing the user to use the ctx.data object as a "junk drawer" and transferring all the responsibility of providing request or response data to each framework plugin.

Before:

```js
  const { pipelineBuilder } = require('@bautajs/core');

    const pipeline1 = pipelineBuilder(p =>
      p.pipe((_, ctx) => {
          ctx.res.json({ id: ctx.req.params.id});
        }
      )
    );
```

After:

```js
  const { getRequest, getResponse } = require('@bautajs/express');
  const { pipe } = require('@bautajs/core');

    const pp = pipe((_, ctx) => {
          const req = getRequest(ctx);
          const res = getResponse(ctx);

          res.json(req.params.id);
        }
      )
```

### rest-datasource

Core package of rest-datasource [got](https://github.com/sindresorhus/got) it's updated from 10.x to 11.x and some breaking changes has been introduced.
You can find all the breaking changes on https://github.com/sindresorhus/got/releases/tag/v11.0.0.

Some of the most important changes are:

- Proxy Agent

```
{
-    agent: new https.Agent({keepAlive: true})
}

{
+    agent: {
+        http: new http.Agent({keepAlive: true}),
+        https: new https.Agent({keepAlive: true}),
+        http2: new http2wrapper.Agent()
+    }
}
```

- The error.request property is no longer a ClientRequest instance. Instead, it gives a Got stream, which provides a set of useful properties.
const got = require('got');

(async () => {
    try {
        await got('https://sindresorhus.com/notfound');
    } catch (error) {
        console.log(`Request failed: ${error.message}`);
        console.log('Download progress:', error.request.downloadProgress);
    }
})();

### bautajs-fastify

Fastify has been updated to his version V3. Even tough there is no change on this library API you might referrer to to [Fastify V3 migration guide](https://github.com/fastify/fastify/releases/tag/v3.0.0) to see what changes are impacting your current implementation.


### decorator-cache

Cache decorator internal library has been change from [moize](https://github.com/planttheidea/moize) to [quick-lru-cjs](https://github.com/javi11/quick-lru-cjs) in order to improve the performance.

Initialization:

Before: 

```js
       const { pipelineBuilder } = require('@bautajs/core');
       const { cache } = require('@bautajs/decorator-cache');

        const normalizer = (prev) => {
          return prev.iAmTheKey;  // prev may be a primitive
        };

        const pp = pipelineBuilder(p =>
          p
            .pipe((_, ctx) => {
              return ctx.data.value;
            },
            value => ({ a: '123', b: value }),
            result => ({ ...result, new: 1 })
          )
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .pipe((_, ctx) => {
              return { iAmTheKey: ctx.data.value };
            },
            cache(pp, normalizer)
        );
```

After, maxSize is a mandatory parameter:

```js
       const { pipe } = require('@bautajs/core');
       const { cache } = require('@bautajs/decorator-cache');

        const normalizer = (prev) => {
          return prev.iAmTheKey;  // prev may be a primitive
        };

        const pp = pipe((_, ctx) => {
              return ctx.data.value;
            },
            value => ({ a: '123', b: value }),
            result => ({ ...result, new: 1 })
          );

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .pipe((_, ctx) => {
              return { iAmTheKey: ctx.data.value };
            },
            cache(pp, normalizer, { maxSize: 5 })
        );
```
