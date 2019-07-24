## bautajs-express

A express framework implementation for `bautajs`.

** All methods exposed on `@bautajs/core` will be available on `@bautajs/express` package **

## How to install

Make sure that you have access to [Artifactory][1]

```console
  npm install @bautajs/express
```

## Usage

```js
const { BautaJSExpress } = require('@bauta/express');
const apiDefinition = require('../../api-definition.json');

const bautJSExpress = new BautaJSExpress(apiDefinition, {});
bautJSExpress.applyMiddlewares();
bautaJS.listen();
```

See full example on [Example of a project from scratch](../../docs/hello-world.md).

[1]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/