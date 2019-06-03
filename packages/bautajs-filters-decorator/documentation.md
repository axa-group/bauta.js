## BautaJS filters decorator

A loopback filters decorator using [loopback-filters][1] for bautaJS resolvers


## How to install

Make sure that you have access to [Artifactory][2]

```console
  npm install @bautajs/filters-decorator
```


## Usage

Just add it as a normal decorator

```js
  const { queryFilter } = require('@bautajs/filters-decorator');

  module.exports = (services)=> {
      services.pets.v1.get.setup(p => p.push(() => [{a:'foo'}, {a:'foo2'}]).push(queryFilter))
  }
```

With the given request '/pets?filter[where][a]=foo' the result will be:

```json
[{
  "a":"foo"
}]
```

[1]: https://github.com/strongloop/loopback-filters

[2]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/
