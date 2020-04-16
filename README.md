# Bauta Node JS

## Migrate from 2.x.x to 3.x.x

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

## Getting started

To get started with BautaJS:

Install with npm install `@bautajs/<integration>` or `@bautajs/core`

There are two ways to install @bautajs:

  - Standalone: For applications that do not require an existing web framework, use the @bautajs/core package.
  - Integrations: For applications with a web framework (e.g. express, koa, hapi, etc.), use the appropriate BautaJS integration package.

## Usage

See [Example of a project from scratch](./docs/hello-world.md).
See more complex example at [bautajs-example](./packages/bautajs-example)

## Packages

- [BautaJS Core](./packages/bautajs-core)
- [BautaJS Express](./packages/bautajs-express)
- [BautaJS Cache Decorator](./packages/bautajs-decorator-cache)
- [BautaJS Filter Decorator](./packages/bautajs-decorator-filter)
- [BautaJS Template Decorator](./packages/bautajs-decorator-template)
- [BautaJS Rest Datasource](./packages/bautajs-datasource-rest)
- [BautaJS Fastify](./packages/bautajs-fastify)

## Features

- [API Definition](./docs/api-definition.md)
- [API Versioning](./docs/api-versioning.md)
- [Datasources](./docs/datasources.md)
- [Debug](./docs/debug.md)
- [Request cancelation](./docs/request-cancelation.md)
- [OperatorFunction and Resolvers](./docs/operator-and-resolver.md)
- [Validation](./docs/validation.md)

## Contributing

You can read the guide of how to contribute at [Contributing](./CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](./CODE_OF_CONDUCT.md).

## Who is behind it?

This project is developed by AXA Group Operations Spain S.A.

### License

Copyright (c) AXA Group Operations Spain S.A.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
