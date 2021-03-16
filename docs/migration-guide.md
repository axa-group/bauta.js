# Migration Guide from 3.x.x to 4.x.x

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
        const normalizer = (prev) => {
          return prev.iAmTheKey;  // prev may be a primitive
        };

        const pp = pipelineBuilder(p =>
          p
            .pipe((_, ctx) => {
              return ctx.req.params.value;
            },
            value => ({ a: '123', b: value }),
            result => ({ ...result, new: 1 })
          )
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .pipe((_, ctx) => {
              return { iAmTheKey: ctx.req.params.value };
            },
            cache(pp, normalizer)
        );
```

After, maxSize is a mandatory parameter:

```js
        const normalizer = (prev) => {
          return prev.iAmTheKey;  // prev may be a primitive
        };

        const pp = pipelineBuilder(p =>
          p
            .pipe((_, ctx) => {
              return ctx.req.params.value;
            },
            value => ({ a: '123', b: value }),
            result => ({ ...result, new: 1 })
          )
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .pipe((_, ctx) => {
              return { iAmTheKey: ctx.req.params.value };
            },
            cache(pp, normalizer, { maxSize: 5 })
        );
```
