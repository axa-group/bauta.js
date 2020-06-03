## bautajs-fastify

A fastify framework implementation for `bautajs`.

## How to install

```console
  npm install @bautajs/fastify
```

## Usage

```js
const { bautajsFastify } = require('@bauta/fastify');
const fastify = require('fastify')();
const apiDefinition = require('../../api-definition.json');

fastify.register(bautajsFastify, {
  apiDefinitions,
  resolversPath: './glob-path-to-your-resolvers/*.js',
  staticConfig: {
    someVar: 2
  }
});

fastify.listen(3000, err => {
  if (err) throw err;
  fastify.log.info('Server listening on localhost:', fastify.server.address().port);
});
```
## Features

Bauta in fastify is added as a [plugin](https://github.com/fastify/fastify/blob/master/docs/Plugins.md). Once this plugin is registered in fastify, automatically the fastify and the bautajs object will be decorated with both instances; `bautajs.fastify` and `fastify.bautajs`.

### Fastify included plugins

By default the following plugins are included on the fastify instance

- [fastify-helmet](https://github.com/fastify/fastify-helmet) - security plugin for your API
- [fastify-oas](https://github.com/SkeLLLa/fastify-oas) - Automatic swagger documentation exposed through the `/explorer` path
- [fastify-sensible](https://github.com/fastify/fastify-sensible) - Utils such error creation, assertions among others.

### Request cancelation

In case the client closes the connection `@bautajs/fastify` will handle the request cancellation for you closing all datasources connections or triggering all the onClose event listeners. See more info on [request cancellation](../../docs/request-cancelation.md)


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