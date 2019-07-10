# Bauta Node JS

## Migrate from 1.x.x to 2.x.x

See [migration guide](./docs/migration-guide.md) or [changelog](./CHANGELOG.md)

## What is bautaJS

BautaJS is mainly a library for build NodeJS middlewares in 'seconds'.

Some of the features of this library are:

- Dynamic dataSources
- API versioning
- Request validation
- Easy debug
- Code self organized
- Build in swagger explorer
- Request like features such multipart request, proxy support... and much more.

## Why use this

Because is easy to learn, tested, it's not a framework, it's light and fast and it comes with a lot of cool features.

## Getting started

To get started with BautaJS:

Install with npm install `@bautajs/<integration>` or `@bautajs/core`

There are two ways to install @bautajs:

  - Standalone: For applications that do not require an existing web framework, use the @bautajs/core package.
  - Integrations: For applications with a web framework (e.g. express, koa, hapi, etc.), use the appropriate BautaJS integration package.

## Usage

To use bautaJS with the default configuration we will need to create the following folder structure:

-   server
    -   services
        -   v1
            -   cats
                -   cats-datasource.js
                -   cats-resolver.js
    -   server.js
    -   api-definitions.json

For this example we will use `@bautajs/datasource-rest` for do http requests
```js
// cats-datasource.js
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  "services": {
    "cats": {
      "operations": [
        {
          "id": "find",
          options(previousValue, ctx, $static, $env): {
            return {
              method: 'GET',
              url: `${$static.config.endpoint}/getsomecat`
            }
          }
        }
      ]
    }
  }
})
```

// cats-resolver.js

```js
  const { compileDataSource } = require('@bautajs/datasource-rest');
  const { resolver } = require('@bautajs/express');

  module.exports = resolver(services => {
    services.cats.v1.find
      .setup(p => 
        p.push(compileDataSource((previousValue, ctx, dataSource) => {
          ctx.logger.info('Fetching some cats');

          return dataSource.request();
        }))
      )
  });
```

// api-definitions.json

```json
  [
    {
      "openapi": "3.0",
      "apiVersion": "1.0",
      "swaggerVersion": "1.0",
      "info": {
        "description": "API for cool cats",
        "version": "v1",
        "title": "My API"
      },
      "servers": [{
        "url":"/v1/api/"
      }],
      "paths": {
        "/cats": {
          "get": {
            "tags": ["cats"],
            "summary": "Get the list of cats",
            "operationId": "find",
            "produces": ["application/json"],
            "responses": {
              "200": {
                "description": "successful operation",
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "Object",
                    "properties": {
                      "name": {
                        "type": "string"
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
  ]
```

// server.js

```js
    const { BautaJSExpress } = require('@bautajs/express');
    const apiDefinitions = require('./api-definitions.json');

    const bautaJS = new BautaJSExpress(apiDefinitions, {
      dataSourceStatic: {
        config: {
          endpoint:'http://coolcats.com'
        }
      }
    });

    await bautaJS.services.cats.v1.find.run({});
```

This will produce a request to `coolcats.com` with the result:

```json
  [
    {
      "name": "cat1"
    }
  ]
```

## Packages

- [BautaJS](./packages/bautajs)
- [BautaJS Express](./packages/bautajs-express)
- [BautaJS Cache Decorator](./packages/bautajs-decorator-express)
- [BautaJS Filter Decorator](./packages/bautajs-decorator-filter)
- [BautaJS Template Decorator](./packages/bautajs-decorator-template)
- [BautaJS Rest Datasource](./packages/bautajs-datasource-rest)
- [BautaJS environment](./packages/bautajs-environment)

## Documentation

- [API Definition](./docs/api-definition.md)
- [API Versioning](./docs/api-versioning.md)
- [Datasources](./docs/datasources.md)
- [Debug](./docs/debug.md)
- [Functional Programing](./docs/functional-programing.md)
- [Steps and Resolvers](./docs/step-and-resolver.md)
- [Validation](./docs/validation.md)

## Contributing

### Install

To install the project dependencies, run:

```console
npm install
```

It installs the `node_modules` dependencies.

### Testing

- To run all tests, use `npm run test`.
- To run units tests, use `npm run units`.
- To run specific package units tests, use `npm run units -- --projects=./packages/bautajs`.
- To run specific package tests, use `npm run test -- --projects=./packages/bautajs`.
- To run the linter use, use `npm run lint`.
- To clean the packages node_modules, use `npm run clean`.
- To bootstrap the packages node_modules, use `npm run bootstrap`.

### CI and release

- To do a release and publish to the artifactory, use `npm run release -- patch`.

### Git Commit Messages

- Use [conventional commits](https://www.conventionalcommits.org).
- Use the present tense ("Add feature" not "Added feature").
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...").
- Limit the first line to 50 characters or less.
- Reference issues and pull requests explicitly.

### Contributors

- [View Contributors](https://github.axa.com/Digital/bauta-nodejs/graphs/contributors)

### License

- See [LICENSE.TXT](./LICENSE.TXT)
