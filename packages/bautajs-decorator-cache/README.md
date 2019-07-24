## BautaJS cache decorator

A cache decorator using [memoizee][1] for bautaJS pipelines


## How to install

Make sure that you have access to [Artifactory][2]

```console
  npm install @bautajs/cache-decorator
```


## Usage

Include it on your pipeline as follows:

```js
  const { cache } = require('@bautajs/decorator-cache');
  const { someHeavyOperation } = require('./my-helper');

  module.exports = resolver((operations)=> {
      const normalizer = (value, ctx) => ctx.id;
      operations.v1.op1.setup(p => 
        p.push(
            cache(
                [
                    someHeavyOperation,
                    (result) => ({...result, otherprop:1})
                ], 
                normalizer,
                { maxAge:3500 }
            )
        )
    );
  })
```

[1]: https://www.npmjs.com/package/memoizee#configuration

[2]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/