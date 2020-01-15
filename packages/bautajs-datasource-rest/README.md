## BautaJS datasource REST

A rest datasource of providers for `bautajs`.
It allows to do requests to third party APIs using [got](https://github.com/sindresorhus/got) and include it on the pipeline.


## How to install

```console
  npm install @bautajs/datasource-rest
```


## Usage

Create the datasource

```js
  // my-datasource.js
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  providers:[
    {
      id:"test",
      options(_, ctx, $static){
        const acceptLanguage = !ctx.req.headers.accept-language? 'my default lang' : ctx.req.headers['accept-language'];

        return {
          url: $static.config.url,
          json: true,
          headers: {
            "Accept-Language": acceptLanguage,
            "user-agent": ctx.req.headers['user-agent']
          }
        }
      }
    }
  ]
});
```

Use it on your resolver. Note the datasource is exposed by its `id`.

```js
// my-resolver.js
const { resolver } = require('@bautajs/express');
const { test } = require('./my-datasource');

module.exports = resolver((operations) => {
  operations.v1.findCats.setup(p => 
    p.push(test())
  )
});
```

See more examples on [Datasources](../../docs/datasources.md)

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