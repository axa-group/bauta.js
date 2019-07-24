## BautaJS datasource REST

A rest datasource of providers for `bautajs`.
It allows to do requests to third party APIs using [got](https://github.com/sindresorhus/got) and include it on the pipeline.


## How to install

Make sure that you have access to [Artifactory][1]

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

[1]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/