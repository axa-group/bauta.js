## BautaJS cache decorator

A cache decorator using [memoizee][1] for bautaJS resolvers


## How to install

Make sure that you have access to [Artifactory][2]

```console
  npm install @bautajs/cache-decorator
```


## Usage

Just add it as a normal decorator

```js
  const { request } = require('@bautajs/decorators');
  const { cache } = require('@bautajs/cache-decorator');

  module.exports = (services)=> {
      const normalizer = (value, ctx) => ctx.id;
      services.pets.v1.get.setup(p => p.push(cache([request(), (result) => ({...result, otherprop:1}), someHeavyOperation], normalizer, { maxAge:3500 })));
  }
```

[1]: https://www.npmjs.com/package/memoizee#configuration

[2]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/