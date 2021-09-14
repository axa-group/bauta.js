## bautajs-express

A express framework implementation for `bautajs`.

** All methods exposed on `@bautajs/core` will be available on `@bautajs/express` package **

## How to install

```console
  npm install @bautajs/express
```

## Usage

```js
const express = require('express');
const { BautaJSExpress } = require('@bauta/express');
const apiDefinition = require('../../api-definition.json');

const app = express();
const bautaJSExpress = new BautaJSExpress({ apiDefinition });
const router = await bautaJSExpress.buildRouter();

app.router('/v1', router);

app.listen(3000, err => {
  if (err) throw err;
  console.info('Server listening on localhost: 3000');
}); 

```

See full example on [Example of a project from scratch](../../docs/hello-world.md).

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

## Third party dependencies licenses

### Production
 - [@bautajs/core@5.1.0](git+https://github.axa.com/Digital/bauta-nodejs) - MIT*
 - [compression@1.x](https://github.com/expressjs/compression) - MIT
 - [cors@2.x](https://github.com/expressjs/cors) - MIT
 - [express@4.x](https://github.com/expressjs/express) - MIT
 - [express-pino-logger@6.x](https://github.com/pinojs/express-pino-logger) - MIT
 - [helmet@4.x](https://github.com/helmetjs/helmet) - MIT
 - [openapi-types@9.3.0](https://github.com/kogosoftwarellc/open-api/tree/master/packages/openapi-types) - MIT
 - [pino@6.13.2](https://github.com/pinojs/pino) - MIT
 - [route-order@0.1.0](https://github.com/sfrdmn/node-route-order) - MIT
 - [swagger-ui-express@4.x](https://github.com/scottie1984/swagger-ui-express) - MIT

### Development
