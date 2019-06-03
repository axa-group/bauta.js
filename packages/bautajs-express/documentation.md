## bautajs-express

A library to build easy versionable and self organized middlewares for express.

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

As [BautaJSExpress](classes/bautajsexpress.md) extends from [BautaJS](../../bautajs/docs/README.md) referer to his documentation to see more options.

[1]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/