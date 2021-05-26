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
  apiDefinition,
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

- [fastify-openapi-docs](https://github.com/ShogunPanda/fastify-openapi-docs) - Automatic swagger documentation exposed through the `/explorer` path

### Request cancellation

In case the client closes the connection `@bautajs/fastify` will handle the request cancellation for you closing all datasources connections or triggering all the onClose event listeners. See more info on [request cancellation](../../docs/request-cancelation.md)


### Serialization

[Fastify response serialization](https://github.com/fastify/fastify/blob/main/docs/Validation-and-Serialization.md#serialization) is enabled by default if a response schema is provided, so this means that missing properties from the schema will not be returned on the response. Although, this behaviour can be disabled by the setting `strictResponseSerialization` set to false.

Notice that as in `bautajs`, here fastify uses the response schema to improve the API performance and speed, because of that is recommended to enable the `strictResponseSerialization` when using fastify plugin.

⚠️ **But take care with this feature since fastify will [coerce types on your resultant response](https://github.com/fastify/fast-json-stringify#nullable)**

### Validation

As fastify comes with a native request validations, `bautajs` request validations are not used. Although the validation behavior will be the same as using the `bautajs` ones as the validation engine is configured equally. Then the `enableRequestValidation` option will be used to enable and disable the fastify request validation.

Regarding response validation the option `enableResponseValidation` is used. By default as in `bautajs` this feature is disabled and is not recommended to be enabled on production.

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
