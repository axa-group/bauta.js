## BautaJS cache decorator

A cache decorator using [memoizee](https://www.npmjs.com/package/memoizee#configuration) for bautaJS pipelines


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

- Remember to use properties [promise](https://github.com/medikoo/memoizee#promise-returning-functions) or [async](https://github.com/medikoo/memoizee#nodejs-callback-style-functions) if you are using an async or promise based pipeline.

- Cache only accept executable pipeline (pipelineBuilder) as a first parameter

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