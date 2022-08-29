## bautajs-fastify

A Fastify plugin for Bauta.js.

## How to install

```console
  npm install @axa/bautajs-fastify
```

## Usage

```js
const { bautajsFastify } = require('@axa/fastify');
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


### Fastify included plugins

By default the following plugins are included on the fastify instance

- [fastify-openapi-docs](https://github.com/ShogunPanda/fastify-openapi-docs) - Automatic swagger documentation exposed through the `/explorer` path

### Serialization

[Fastify response serialization](https://github.com/fastify/fastify/blob/main/docs/Validation-and-Serialization.md#serialization) is enabled by default if a response schema is provided, so this means that missing properties from the schema will not be returned on the response. Although, this behaviour can be disabled by the setting `strictResponseSerialization` set to false.

### Validation

Fastify has a out-of-the-box request validation, therefore the builtin Bauta.js request validations is disabled on this plugin.

# Legal Notice

Copyright (c) AXA Group. All rights reserved.
Licensed under the (MIT / Apache 2.0) License.
# Third party dependencies licenses

## Production
 - [@axa/bautajs-core@5.1.0](git+https://github.com/axa-group/bauta.js) - MIT*
 - [fastify@4.5.2](https://github.com/fastify/fastify) - MIT
 - [@fastify/swagger@7.4.1](https://github.com/fastify/fastify-swagger) - MIT
 - [fastify-plugin@4.2.1](https://github.com/fastify/fastify-plugin) - MIT
 - [fastify-x-request-id@2.0.0](https://github.com/dimonnwc3/fastify-x-request-id) - MIT
 - [route-order@0.1.0](https://github.com/sfrdmn/node-route-order) - MIT

## Development
 - [@axa/bautajs-datasource-rest@5.1.2](https://github.com/axa-group/bauta.js) - MIT*

## Third party dependencies licenses

### Production
 - [@axa/bautajs-core@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [fastify@3.29.0](https://github.com/fastify/fastify) - MIT
 - [fastify-openapi-docs@0.4.0](https://github.com/ShogunPanda/fastify-openapi-docs) - ISC
 - [fastify-plugin@3.0.1](https://github.com/fastify/fastify-plugin) - MIT
 - [fastify-x-request-id@2.0.0](https://github.com/dimonnwc3/fastify-x-request-id) - MIT
 - [route-order@0.1.0](https://github.com/sfrdmn/node-route-order) - MIT

### Development
 - [@axa/bautajs-datasource-rest@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
