## BautaJS decorators

Decorator to use on bautaJS resolvers


## How to install

Make sure that you have access to [Artifactory][1]

```console
  npm install @bautajs/decorators
```


## Usage

Just imported and added as if was your own created function

```js
  const { request } = require('@bautajs/decorators');

  module.exports = (services) => {
      services.pets.v1.get.setup(p => p.push(request()));
  }
```

## Available decorators

  - [asCallback](#ascallback)
  - [asValue](#asvalue)
  - [compileDataSource](#compiledatasource)
  - [request](#request)
  - [template](#template)

[1]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/
