## bautajs-express

A Express.js plugin for Bauta.js.

## How to install

```console
  npm install @axa/bautajs-express
```

## Usage

```js
const express = require('express');
const { BautaJSExpress } = require('@axa/express');
const apiDefinition = require('../../api-definition.json');

const app = express();
const bautaJSExpress = new BautaJSExpress({ apiDefinition });
const router = await bautaJSExpress.buildRouter();

app.use('/v1', router);

app.listen(3000, err => {
  if (err) throw err;
  console.info('Server listening on localhost: 3000');
});

```

See a full example on [Example of a project from scratch](../../docs/hello-world.md).
# Legal Notice

Copyright (c) AXA Group. All rights reserved.
Licensed under the (MIT / Apache 2.0) License.

## Third party dependencies licenses

### Production
 - [@axa/bautajs-core@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [compression@1.7.4](https://github.com/expressjs/compression) - MIT
 - [cors@2.8.5](https://github.com/expressjs/cors) - MIT
 - [express@4.18.1](https://github.com/expressjs/express) - MIT
 - [express-pino-logger@6.0.0](https://github.com/pinojs/express-pino-logger) - MIT
 - [helmet@5.1.0](https://github.com/helmetjs/helmet) - MIT
 - [openapi-types@12.0.0](https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-types) - MIT
 - [pino@6.13.2](https://github.com/pinojs/pino) - MIT
 - [route-order@0.1.0](https://github.com/sfrdmn/node-route-order) - MIT
 - [swagger-ui-express@4.4.0](https://github.com/scottie1984/swagger-ui-express) - MIT

### Development
