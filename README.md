# Bauta Node JS

## Migrate from 3.x.x to 5.x.x

See [migration guide](./docs/migration-guide.md) or [changelog](./CHANGELOG.md)

## What is bautaJS

BautaJS is mainly a library for build NodeJS middleware's in 'seconds'.

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
- ![BautaJS Filter Decorator (Deprecated)]
- ![BautaJS Template Decorator (Deprecated)]
- [BautaJS Rest Datasource](./packages/bautajs-datasource-rest)
- [BautaJS Fastify](./packages/bautajs-fastify)

## Features

- [API Definition](./docs/api-definition.md)
- [API Versioning](./docs/api-versioning.md)
- [Datasources](./docs/datasources.md)
- [Debug](./docs/debug.md)
- [Request cancelation](./docs/request-cancelation.md)
- [Pipeline.StepFunction and Resolvers](./docs/decorators-and-resolver.md)
  - Some of the available decorators
    - [parallel](./docs/decorators/parallel.md)
    - [parallelSettled](./docs/decorators/parallelSettled.md)
    - [iff](./docs/decorators/iff.md)
    - [match](./docs/decorators/match.md)
- [Validation](./docs/validation.md)
- [Configuration Options](./docs/configuration-options.md)

## Testing

Check - [Testing](./docs/testing.md)

## Benchmark

See [Benchmark](./docs/benchmark.md)

## Contributing

You can read the guide of how to contribute at [Contributing](./CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](./CODE_OF_CONDUCT.md).

## Who is behind it?

This project is developed by AXA Group Operations Spain S.A.

# Legal Notice

Copyright (c) AXA Group. All rights reserved.
Licensed under the (MIT / Apache 2.0) License.
