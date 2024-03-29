## cache decorator

A cache decorator using [quick-lru](https://github.com/sindresorhus/quick-lru) for Bauta.js pipelines.

## Usage

Include it on your pipeline as follows:

```js
  import { pipe, createContext, cache } from '@axa/bautajs-core';

  function createAKey(prev, ctx, bautajs) {
   ctx.data.myKey = 'mykey';
  }

  function doSomethingHeavy(prev, ctx, bautajs) {
   let acc = 0;
   for(let i=0; i < 1000000000; i++) {
     acc += i;
   }

   return acc;
  }

  const myPipeline = pipe(
   createAKey,
   doSomethingHeavy
  );

  const cacheMyPipeline = cache(myPipeline, { maxSize:3 }, (prev, ctx) => ctx.data.myKey);

  const result = await cacheMyPipeline(null, createContext({req:{}}), {});
  console.log(result);
```

- Cache only accept executable pipeline (pipe) as a first parameter
- Normalize should use a synchronous function to improve performance and it should be quick (O(1)) to make sure that there are no performance penalties.

## Normalize

Normalize functions must return an identifier key in the form of a primitive type that is used to determine if a new value requires cache or not. If you need to use more than one field to generate a key, concatenate or stringify those fields that you need.

### Normalize with only context fields

It is straightforward and you can do the following:

```js
const normalizer = (_, ctx) => ctx.data.whatever_field;
```

### Normalize uses at least one field from a previously generated object

This is trickier because you have to take into account that you will not have the result of the pipeline to be passed as the object to be used as the key. For example, this will not work:


```js
  const { pipe, cache } = require('@axa/bautajs-core');  
  const { someHeavyOperation } = require('./my-helper');

  const myPipeline = pipe( someHeavyOperation, (result) => ({...result, iWantToUseAsKeyThis:1}))

  module.exports = resolver((operations)=> {
      const normalizer = (value) => value.iWantToUseAsKeyThis;
      operations.v1.op1.setup(p =>
        p.pipe(
            cache(
                myPipeline,                
                { maxSize:5 },
                normalizer // When normalizer is called, result from pipeline is not yet there
            )
        )
    );
  })
```

This will not work because iWantToUseAsKeyThis is the result of the pipeline that you are trying to cache and it is not executed yet when the cache decorator is being called. Thus, the normalizer instruction will result in an error.

To use the object as a key in the cache normalizer, this object needs to be set in the previous pipeline of the cache, like in the following example:

```js
        const normalizer = (prev) => {
          return prev.iAmTheKey;  // prev may be a primitive
        };

        const pp = pipe((_, ctx) => {
              return 'test';
            },
            value => ({ a: '123', b: value }),
            result => ({ ...result, new: 1 })
          )

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .pipe((_, ctx) => {
              return { iAmTheKey: 'test' };
            },
            cache(pp, { maxSize: 5 }, normalizer)
        );
```

In here you can see that we have an decorator function that returns an object with a key iAmTheKey that is passed to normalizer previous to the decorator function of the cache.

# Legal Notice

Copyright (c) AXA Group. All rights reserved.
Licensed under the (MIT / Apache 2.0) License.

## Third party dependencies licenses

### Production
 - [@axa/bautajs-core@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [node-object-hash@2.3.10](https://github.com/SkeLLLa/node-object-hash) - MIT
 - [quick-lru-cjs@5.2.1](https://github.com/javi11/quick-lru-cjs) - MIT

### Development
