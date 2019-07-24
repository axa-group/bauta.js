## BautaJS filters decorator

A loopback filters decorator using [loopback-filters][1] for bautaJS resolvers


## How to install

Make sure that you have access to [Artifactory][2]

```console
  npm install @bautajs/filters-decorator
```


## Usage

Include it on the step you need to apply the filters, the decorator will automatically filter the previous step result using
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

[1]: https://github.com/strongloop/loopback-filters

[2]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/
