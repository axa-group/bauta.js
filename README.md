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

- [BautaJS](./packages/bautajs)
- [BautaJS Express](./packages/bautajs-express)
- [BautaJS Cache Decorator](./packages/bautajs-decorator-express)
- [BautaJS Filter Decorator](./packages/bautajs-decorator-filter)
- [BautaJS Template Decorator](./packages/bautajs-decorator-template)
- [BautaJS Rest Datasource](./packages/bautajs-datasource-rest)

## Features

- [API Definition](./docs/api-definition.md)
- [API Versioning](./docs/api-versioning.md)
- [Datasources](./docs/datasources.md)
- [Debug](./docs/debug.md)
- [Request cancelation](./docs/request-cancelation.md)
- [OperatorFunction and Resolvers](./docs/operator-and-resolver.md)
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
