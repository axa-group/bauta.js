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

Install with npm install @bautajs/<integration> or @bautajs/core

There are two ways to install Apollo Server:

  - Standalone: For applications that do not require an existing web framework, use the @bautajs/core package.
  - Integrations: For applications with a web framework (e.g. express, koa, hapi, etc.), use the appropriate BautaJS integration package.

See the usage at [bautaJS](./packages/bautajs) package.

## Packages

- [BautaJS](./packages/bautajs)
- [BautaJS Express](./packages/bautajs-express)
- [BautaJS Cache Decorator](./packages/bautajs-cache-decorator)
- [BautaJS Decorators](./packages/bautajs-decorator)
- [Multipart request builder](./packages/multipart-request-builder)
- [Native proxy agent](./packages/native-proxy-agent)

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

### Documentation

- To regenerate all the packages' `README.md`, use `npm run documentation`.

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
