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

### License

The MIT License (MIT) Copyright © 2021 AXA Group
 
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 
All AXA Companies constitute the "AXA Group" where "AXA Company" shall mean:
 
(i) AXA, "Société Anonyme" with a Board of Directors (herein "AXA SA") having its principal offices at 25, avenue Matignon, 75008 Paris, registered on the Commercial Registry of Paris under the number 572 093 920; and
 
(ii)    any other company controlled by, or controlling AXA SA, with a company being considered as controlling another:
 
when it holds directly or indirectly a portion of the capital according to it the majority of the voting rights in general meetings of shareholders of this company;
when it holds solely the majority of the voting rights in this company by virtue of an agreement concluded with other partners or shareholders and which is not contrary to the interest of the company;
when it determines de facto, by voting rights which it holds, the decisions in the general meetings of shareholders of this company;
in any event, when it holds, directly or indirectly, a portion of voting rights greater than 40% and when no other partner or shareholder holds directly or indirectly a portion which is greater than its own; and
(iii)   any economic interest group or joint venture in which AXA SA and/or one or more other Companies of the AXA Group participates for at least 50% in operating costs;
 
(iv)    in the cases where the law applicable to a company limits voting rights or control (such as defined here in above), this company will be deemed to be a company of the AXA Group, if the voting rights in general shareholders' meetings or the control held by a Company of the AXA Group reaches the maximum amount fixed by said applicable law; and
 
(v) any legal entity in which an AXA company holds a lower portion of the capital or of voting rights or cost participation than set forth above when such company is authorized to do business under the name "AXA" or under a name which include the "AXA" business name;
 
(vi)    and any other legal entity in which an AXA Company directly or indirectly has an economic interest. For the avoidance of doubt GIE AXA is deemed an AXA Company.
