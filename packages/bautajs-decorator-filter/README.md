## BautaJS filters decorator

A loopback filters decorator using [loopback-filters](https://github.com/strongloop/loopback-filters) for bautaJS resolvers


## How to install

```console
  npm install @bautajs/filters-decorator
```


## Usage

Include it on the OperatorFunction you need to apply the filters, the decorator will automatically filter the previous OperatorFunction result using
the loopback filters comming from `ctx.req.query.filter`

```js
  const { resolver } = require('@bautajs/core');
  const { queryFilter } = require('@bautajs/decorator-filter');

  module.exports = resolver((operations)=> {
      operations.v1.get.setup(p => p.push(() => [{a:'foo'}, {a:'foo2'}]).push(queryFilter))
  })
```

With the given request '/pets?filter[where][a]=foo' the result will be:

```json
[{
  "a":"foo"
}]
```

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
