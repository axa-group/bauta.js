# Bauta.js

## What is Bauta.js

Bauta.js is an add-on for your Node.js applications such as Express.js or Fastify. Bauta.js improves the developer experience enriching your application architecture and encouraging an API design-first mindset. The main features Bauta.js provides are:

- Express.js plugin.
- Fastify plugin.
- Resolvers.
- Pipelines and Steps functions.
- Decorators.
- Request/Response validation.
- Built-in OpenAPI explorer.
- API versioning.
- Datasource Providers.
- Built-in logging system.
- Written in TypeScript.

## Quick start

To get started with Bauta.js, we recommend using one of the framework's plugins it exposes. For example, if you feel comfortable writing your Node.js applications using Express.js, you should use the Bauta.js Express plugin. However, we recommend the usage of the Bauta.js Fastify plugin.

First, get Bauta.js with npm and the required dependencies:

```console
npm i fastify@3 @axa/bautajs-core @axa/bautajs-fastify
```

Then create `server.js` and add the following content:

```js
const fastify = require('fastify')({ logger: true });
const { resolver } = require('@axa/bautajs-core');
const { bautajsFastify } = require('../dist/index');

// You can use your own OpenAPI specifications ;)
const apiDefinition = {
  openapi: '3.0.0',
  info: {
    version: 'v1',
    title: 'Bauta.js quick start'
  },
  paths: {
    '/greetings': {
      get: {
        operationId: 'getGrettings',
        responses: {
          200: {
            description: 'say hello world :)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    hello: {
                      type: 'string'
                    },
                    name: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

fastify.register(bautajsFastify, {
  apiDefinition,
  resolvers: [
    resolver(operations => {
      operations.getGrettings.setup(() => ({ hello: 'world' }));
    })
  ],
  apiBasePath: '/api'
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
```

Launch the server:

```console
node server.js
````

You can test it with curl:

```console
curl http://localhost:3000/api/grettings

=> { hello: 'world' }
```

## Features
### Resolvers

Bauta.js Core creates every operation described on the OpenAPI schema as a route when the plugin is initialized. The resolvers are where you specify the logic of every route/operation. A resolver can be an async function too.

We recommend writing the resolvers in a separate Node.js module using a specific name pattern used on the Bauta.js plugin initialization as a glob. For example, we could have our resolvers on files named like _greeting_-resolver.js and then initialize the Bauta.js instance like the following:

```js
// server.js
...

fastify.register(bautajsFastify, {
  apiDefinition,
  resolversPath: '*-resolver.js',
  apiBasePath: '/api'
});

...
```

```js
// greeting-resolver.js
const { resolver } = require('@axa/bautajs-core');

module.exports = resolver(operations => {
  operations.getGrettings.setup(() => ({ hello: 'world' }));
})
//
```

### Pipelines

Bauta.js provides a set of decorators to ease writing the logic of your endpoint's resolvers. One of the most exciting decorators is `pipe`. It allows expressing the logic as a flow of data that follows a pipeline. It helps to separate the logic on small reusable and testable functions called `steps`. A step function can be async.

```js

const { pipe, resolver } = require('@axa/bautajs-core');

module.exports = resolver(operations => {
  operations.getGrettings.setup(
    pipe(
      () => ({ hello: 'world' }),
      (previous) => ({...previous, name: 'pepe'})
    );
})
```

Bauta.js passes to every Step function of a Pipeline a `Context` (ctx) object, unique by request, including a logger, the request's id, and data transmitted through all the pipeline steps t. Check additional information about the [Bauta.js Context on its dedicated documentation page](./docs/bautajs-context.md).

To understand better about Step functions and Pipelines your can read the following documentation [page](docs/resolvers.md).

### Decorators

Bauta.js has a set of valuable decorators that you can use to build your resolvers pipelines.

- [parallel](./docs/decorators/parallel.md)
- [parallelSettled](./docs/decorators/parallel-all-settled.md)
- [iif](./docs/decorators/iif.md)
- [match](./docs/decorators/match.md)
- [map](./docs/decorators/map.md)
- [parallelMap](./docs/decorators/parallelMap.md)
- [pairwise](./docs/decorators/pairwise.md)
- [tap](./docs/decorators/tap.md)
- [retryWhen](./docs/decorators/retry-when.md)

### Request and response validation

Bauta.js validates, based on the OpenAPI schema provided, the request input by default and could validate the response of your endpoints if you enabled it. For further details, take a look to the following [documentation](/docs/validation.md).

### Built-in OpenAPI explorer (swagger)

Using Bauta.js you are ready from the beginning to share your OpenAPI documentation exposed to the `/explorer` endpoint by default.

With the `bautajs-fastify` plugin you will have the capability of having multiple openAPI exposed if you have multiple version exposed of your API (see [API versioning section](./docs/api-versioning.md)). In this case the explorer will be exposed with the prefix of every Bauta.js instance, i.e. `/v1/explorer`.

### API versioning

Bauta.js supports API versioning helping with the management of breaking changes. You only need to implement the new behaviour for the changed endpoints. The endpoints that remain unaltered in the new version can be inherited by higher API versions reusing the implementation on the previous API version. Get more details about how Bauta.js allow API versioning [here](./docs/api-versioning.md).

### Request cancellation

Bauta.js is able to cancel any operation pipeline if the request is aborted or cancelled by the requester. For more details, check its [documentation page](./docs/request-cancelation.md).

### Datasources providers

Bauta.js was born with the aim of implementing Node.js APIs that behaves like middleware to other third parties APIs. With that premise in mind, Bauta.js has the concept of HTTP request datasources. A Bauta.js request datasource is an abstraction of an HTTP(S) request to a third-party API. It's based on the request library [got](https://github.com/sindresorhus/got) and Bauta.js enrich its behaviour by adding useful logs and HTTP(S) proxy support and request cancellation. A datasource can be used as a step function inside any Bauta.js pipeline. Check more examples of datasources on its [specific documentation](./docs/datasources.md).

### Builtin logging system

The logging capability is key to troubleshooting and operates successfully our APIs on production. Using [pino](https://github.com/pinojs/pino) as the default logger, Bauta.js logs useful information in every request: request identifier, endpoint signature, response time, datasources requests information, and so on. Check [here](./docs/logging.md) for additional information.

### Written with TypeScript

Bauta.js is written using TypesScript. Shipped with the typings definitions to improve the developer experience using IntelliSense on your favourite IDE.

## Guides

- [Hello World! API implementation step by step](./docs/guides/hello-world.md) using Bauta.js with Express.js.
- Example of Express.js Bauta.js API project: [bautajs-example](./packages/bautajs-example).
- [How to unit test your code that use Bauta.js?](./docs/guides/testing.md)

## Benchmark

See [Benchmark](./docs/benchmark.md).

## Contributing

You can read the guide of how to contribute at [Contributing](./CONTRIBUTING.md).

Bauta.js is a monorepo containing the following list of packages:

- [BautaJS Core](./packages/bautajs-core)
- [BautaJS Fastify](./packages/bautajs-fastify)
- [BautaJS Express](./packages/bautajs-express)
- [BautaJS Cache Decorator](./packages/bautajs-decorator-cache)
- [BautaJS Rest Datasource](./packages/bautajs-datasource-rest)

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](./CODE_OF_CONDUCT.md).

## Legal Notice

Copyright (c) AXA Group. All rights reserved.
Licensed under the MIT License.

## Third party dependencies licenses

### Production

- [BautaJS Core](./packages/bautajs-core/README.md#third-party-dependencies-licenses)
- [BautaJS Fastify](./packages/bautajs-fastify/README.md#third-party-dependencies-licenses)
- [BautaJS Express](./packages/bautajs-express/README.md#third-party-dependencies-licenses)
- [BautaJS Cache Decorator](./packages/bautajs-decorator-cache/README.md#third-party-dependencies-licenses)
- [BautaJS Rest Datasource](./packages/bautajs-datasource-rest/README.md#third-party-dependencies-licenses)
### Development
 - [@commitlint/config-conventional@17.0.2](https://github.com/conventional-changelog/commitlint) - MIT
 - [@types/body-parser@1.19.2](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/compression@1.7.2](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/cors@2.8.12](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/express@4.17.13](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/express-pino-logger@4.0.3](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/jest@28.1.3](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/node@18.0.0](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/pino@6.3.11](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/split2@3.2.1](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/supertest@2.0.12](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/swagger-ui-express@4.1.3](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@typescript-eslint/eslint-plugin@5.29.0](https://github.com/typescript-eslint/typescript-eslint) - MIT
 - [@typescript-eslint/parser@5.29.0](https://github.com/typescript-eslint/typescript-eslint) - BSD-2-Clause
 - [bench@0.3.6](undefined) - Custom: http://nodejs.org
 - [commitizen@4.2.4](https://github.com/commitizen/cz-cli) - MIT
 - [commitlint@17.0.2](https://github.com/conventional-changelog/commitlint) - MIT
 - [cz-conventional-changelog@3.3.0](https://github.com/commitizen/cz-conventional-changelog) - MIT
 - [eslint@8.18.0](https://github.com/eslint/eslint) - MIT
 - [eslint-config-airbnb-base@15.0.0](https://github.com/airbnb/javascript) - MIT
 - [eslint-config-airbnb-typescript@17.0.0](https://github.com/iamturns/eslint-config-airbnb-typescript) - MIT
 - [eslint-config-prettier@8.5.0](https://github.com/prettier/eslint-config-prettier) - MIT
 - [eslint-plugin-import@2.26.0](https://github.com/import-js/eslint-plugin-import) - MIT
 - [eslint-plugin-jest@26.5.3](https://github.com/jest-community/eslint-plugin-jest) - MIT
 - [eslint-plugin-prettier@4.0.0](https://github.com/prettier/eslint-plugin-prettier) - MIT
 - [fast-safe-stringify@2.1.1](https://github.com/davidmarkclements/fast-safe-stringify) - MIT
 - [form-data@4.0.0](https://github.com/form-data/form-data) - MIT
 - [got@11.8.5](https://github.com/sindresorhus/got) - MIT
 - [husky@8.0.1](https://github.com/typicode/husky) - MIT
 - [jest@28.1.1](https://github.com/facebook/jest) - MIT
 - [jest-config@28.1.1](https://github.com/facebook/jest) - MIT
 - [jest-extended@2.0.0](https://github.com/jest-community/jest-extended) - MIT
 - [jest-junit@13.2.0](https://github.com/jest-community/jest-junit) - Apache-2.0
 - [jest-sonar-reporter@2.0.0](https://github.com/3dmind/jest-sonar-reporter) - MIT
 - [lerna@5.1.5](https://github.com/lerna/lerna) - MIT
 - [nock@13.2.7](https://github.com/nock/nock) - MIT
 - [node-mocks-http@1.11.0](https://github.com/howardabrams/node-mocks-http) - MIT
 - [pino@6.13.2](https://github.com/pinojs/pino) - MIT
 - [prettier@2.7.1](https://github.com/prettier/prettier) - MIT
 - [prettier-check@2.0.0](https://github.com/hexacta/prettier-check) - MIT
 - [split2@4.1.0](https://github.com/mcollina/split2) - ISC
 - [stream-mock@2.0.5](https://github.com/BastienAr/stream-mock) - MIT
 - [supertest@6.2.3](https://github.com/visionmedia/supertest) - MIT
 - [ts-jest@28.0.5](https://github.com/kulshekhar/ts-jest) - MIT
 - [typescript@4.7.x](https://github.com/Microsoft/TypeScript) - Apache-2.0
