## BautaJS cache decorator

A cache decorator using [moize](https://github.com/planttheidea/moize) for bautaJS pipelines


## How to install

```console
  npm install @bautajs/decorator-cache
```


## Usage

Include it on your pipeline as follows:

```js
  const { pipelineBuilder } = require('@bautajs/core');
  const { cache } = require('@bautajs/decorator-cache');
  const { someHeavyOperation } = require('./my-helper');
  
  const myPipeline = pipelineBuilder(p => 
                    p.pipe( someHeavyOperation, (result) => ({...result, otherprop:1}))
  );

  module.exports = resolver((operations)=> {
      const normalizer = ([value, ctx]) => ctx.id;
      operations.v1.op1.setup(p => 
        p.push(
            cache(
                myPipeline, 
                normalizer,
                { maxAge:3500 }
            )
        )
    );
  })
```

- Cache only accept executable pipeline (pipelineBuilder) as a first parameter
- Normalize should use a synchronous function to improve performance and it should be quick (O(1)) to make sure that there are no performance penalties.

## Normalize

Normalize functions must return an identifier key in the form of a primitive type that is used to determine if a new value requires cache or not. If you need to use more than one field to generate a key, concatenate or stringify those fields that you need.

There are two main use cases in normalize: 
- you want to use only fields from the context to generate the key
- you want to use at least one field from a previously generated object

### normalize with only context fields

It is straigthforward and you can do the following:

```js
const normalizer = ([, ctx]) => ctx.whatever_field;
```

### normalize uses at least one field from a previuosly generated object

This is trickier because you have to take into account that you will not have the result of the pipeline to be passed as the object to be used as the key. For example, this will not work:


```js
  const { pipelineBuilder } = require('@bautajs/core');
  const { cache } = require('@bautajs/decorator-cache');
  const { someHeavyOperation } = require('./my-helper');
  
  const myPipeline = pipelineBuilder(p => 
                    p.pipe( someHeavyOperation, (result) => ({...result, iWantToUseAsKeyThis:1}))
  );

  module.exports = resolver((operations)=> {
      const normalizer = ([value]) => value.iWantToUseAsKeyThis;
      operations.v1.op1.setup(p => 
        p.push(
            cache(
                myPipeline, 
                normalizer, // When normalizer is called, result from pipeline is not yet there
                { maxAge:3500 }
            )
        )
    );
  })
```

This will not work because iWantToUseAsKeyThis is the result of the pipeline that you are trying to cache and it is not executed yet when the cache decorator is being called. Thus, the normalizer instruction will result in an error. 

To use the object as a key in the cache normalizer, this object needs to be set in the previous pipeline of the cache, like in the following example:

```js
        const normalizer = ([prev]) => {
          return prev.iAmTheKey;  // prev may be a primitive
        };

        const pp = pipelineBuilder(p =>
          p
            .push((_, ctx) => {
              return ctx.req.params.value;
            })
            .push(value => ({ a: '123', b: value }))
            .push(result => ({ ...result, new: 1 }))
        );

        bautaJS.operations.v1.operation2.setup(p =>
          p
            .push((_, ctx) => {
              return { iAmTheKey: ctx.req.params.value };
            })
            .push(cache(pp, <any>normalizer))
        );
```

In here you can see that we have an operator function that returns an object with a key iAmTheKey that is passed to normalizer previous to the operator function of the cache.


## Options

You can check all the options in the options of [moize](https://github.com/planttheidea/moize#configuration-options)

### Modified defaults

List of values whose default value differs from those in the library:

- maxSize: Library value is 1, @bautajs/decorator-cache has a default value of 25.

## Limitations

There are some options that cannot be used because they are used internally by the cache implementation. Those are:

- matchesKey
- onCacheHit
- onCacheAdd

If you need for your requirements to overwrite this values, it is better than you just use your own implementation of cache decorator.

Another obvious limitation is that you cannot cache depending on the result of the operation being cached, but only depending on an input. This is not a big issue because usually you can get away with caching depending on an input value.

## Contributing

You can read the guide of how to contribute at [Contributing](../../CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](../../CODE_OF_CONDUCT.md).

## Who is behind it?

This project is developed by AXA Group Operations Spain S.A.

### License

Copyright (c) AXA Group Operations Spain S.A.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.