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
    - [parallelSettled](./docs/decorators/parallel-all-settled.md)
    - [iff](./docs/decorators/iff.md)
    - [match](./docs/decorators/match.md)
    - [map](./docs/decorators/map.md)
    - [parallelMap](./docs/decorators/parallelMap.md)
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

## Third party dependencies licenses

### Production

### Development
 - [@commitlint/config-conventional@13.1.0](https://github.com/conventional-changelog/commitlint) - MIT
 - [@types/body-parser@1.19.1](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/compression@1.7.2](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/cors@2.8.12](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/express@4.17.13](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/express-pino-logger@4.0.2](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/jest@27.0.1](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/node@16.7.13](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/pino@6.3.11](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/split2@3.2.0](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/supertest@2.0.11](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@types/swagger-ui-express@4.1.3](https://github.com/DefinitelyTyped/DefinitelyTyped) - MIT
 - [@typescript-eslint/eslint-plugin@4.31.0](https://github.com/typescript-eslint/typescript-eslint) - MIT
 - [@typescript-eslint/parser@4.31.0](https://github.com/typescript-eslint/typescript-eslint) - BSD-2-Clause
 - [bench@0.3.6](undefined) - Custom: http://nodejs.org
 - [commitizen@4.2.4](https://github.com/commitizen/cz-cli) - MIT
 - [commitlint@13.1.0](https://github.com/conventional-changelog/commitlint) - MIT
 - [cz-conventional-changelog@3.3.0](https://github.com/commitizen/cz-conventional-changelog) - MIT
 - [eslint@7.32.0](https://github.com/eslint/eslint) - MIT
 - [eslint-config-airbnb-base@14.2.1](https://github.com/airbnb/javascript) - MIT
 - [eslint-config-airbnb-typescript@14.0.0](https://github.com/iamturns/eslint-config-airbnb-typescript) - MIT
 - [eslint-config-prettier@8.3.0](https://github.com/prettier/eslint-config-prettier) - MIT
 - [eslint-plugin-import@2.24.2](https://github.com/import-js/eslint-plugin-import) - MIT
 - [eslint-plugin-jest@24.4.0](https://github.com/jest-community/eslint-plugin-jest) - MIT
 - [eslint-plugin-prettier@4.0.0](https://github.com/prettier/eslint-plugin-prettier) - MIT
 - [fast-safe-stringify@2.0.8](https://github.com/davidmarkclements/fast-safe-stringify) - MIT
 - [form-data@4.0.0](https://github.com/form-data/form-data) - MIT
 - [got@11.8.2](https://github.com/sindresorhus/got) - MIT
 - [husky@7.0.2](https://github.com/typicode/husky) - MIT
 - [jest@27.1.0](https://github.com/facebook/jest) - MIT
 - [jest-config@27.1.0](https://github.com/facebook/jest) - MIT
 - [jest-extended@0.11.5](https://github.com/jest-community/jest-extended) - MIT
 - [jest-junit@12.2.0](https://github.com/jest-community/jest-junit) - Apache-2.0
 - [lerna@4.0.0](https://github.com/lerna/lerna) - MIT
 - [nock@13.1.3](https://github.com/nock/nock) - MIT
 - [node-mocks-http@1.10.1](https://github.com/howardabrams/node-mocks-http) - MIT
 - [pino@6.13.2](https://github.com/pinojs/pino) - MIT
 - [prettier@2.3.2](https://github.com/prettier/prettier) - MIT
 - [prettier-check@2.0.0](https://github.com/hexacta/prettier-check) - MIT
 - [split2@3.2.2](https://github.com/mcollina/split2) - ISC
 - [stream-mock@2.0.5](https://github.com/BastienAr/stream-mock) - MIT
 - [supertest@6.1.6](https://github.com/visionmedia/supertest) - MIT
 - [ts-jest@27.0.5](https://github.com/kulshekhar/ts-jest) - MIT
 - [typescript@4.4.x](https://github.com/Microsoft/TypeScript) - Apache-2.0
