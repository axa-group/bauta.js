<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

- [bautajs-express][1]
- [How to install][2]
- [Usage][3]
- [BautaJSExpress][4]
  - [Parameters][5]
  - [Examples][6]
  - [applyMiddlewares][7]
    - [Parameters][8]
  - [listen][9]
    - [Parameters][10]

## bautajs-express

A library to build easy versionable and self organized middlewares for express.

## How to install

Make sure that you have access to [Artifactory][11]

```console
  npm install bautajs-express
```

## Usage

```js
const BautaJSExpress = require('bauta-express');
const apiDefinition = require('../../api-definition.json');

const bautJSExpress = new BautaJSExpress(apiDefinition, {});
bautJSExpress.applyMiddlewares();
bautaJS.listen();
```

## BautaJSExpress

**Extends BautaJS**

Create an Express server using the BautaJS library with almost 0 configuration

### Parameters

- `apiDefinitions` **([Array][12]&lt;[Object][13]> | [Object][13])** An array of [OpenAPI 3.0/2.0][14] definitions. See the valid schema @see [./lib/validators/api-definition-schema-json][15].
- `options` **[Object][13]?**
  - `options.dataSourcesPath` **([string][16] \| [Array][12]&lt;[string][16]>)** A [node-glob][17] path to your dataSources. (optional, default `'./server/services/../.datasource.?(js|json)'`)
  - `options.loadersPath` **([string][16] \| [Array][12]&lt;[string][16]>)** A [node-glob][17] path to your loaders definitions. (optional, default `'./server/services/../.loader.js'`)
  - `options.dataSourceCtx` **any** Object to be injected on the dataSources in run time (optional, default `{}`)
  - `options.servicesWrapper` **[function][18]?** function that have services as entry point and could be used to wrap services with global behaviours

### Examples

```javascript
const BautaJSExpress = require('bauta-express');
const apiDefinition = require('../../api-definition.json');

const bautJSExpress = new BautaJSExpress(apiDefinition, {});
bautJSExpress.applyMiddlewares();
bautaJS.listen();
```

### applyMiddlewares

Add the standard express middlewares and create the created services routes using the given OpenAPI definition.

#### Parameters

- `options` **[Object][13]** Optional triggers for express middlewares (optional, default `{}`)
  - `options.cors` **([Object][13] \| [boolean][19])** Set as false to not add it. Set as an object to pass options to the cors middleware. (optional, default `true`)
  - `options.bodyParser` **([Object][13] \| [boolean][19])** Set as false to not add it. Set as an object to pass options to the body parse middleware. (optional, default `true`)
  - `options.helmet` **([Object][13] \| [boolean][19])** Set as false to not add it. Set as an object to pass options to the helmet middleware. (optional, default `true`)
  - `options.morgan` **([Object][13] \| [boolean][19])** Set as false to not add it. Set as an object to pass options to the morgan middleware. (optional, default `true`)
  - `options.explorer` **([Object][13] \| [boolean][19])** Set as false to not add it. Set as an object to pass options to the explorer middleware. (optional, default `true`)

Returns **[BautaJSExpress][20]**

### listen

Start the express server as http/https listener

#### Parameters

- `port` **[number][21]** The port to listener (optional, default `3000`)
- `host` **[string][16]** The api host (optional, default `'localhost'`)
- `httpsEnabled` **[boolean][19]** True to start the server as https server (optional, default `false`)
- `httpsOptions` **[Object][13]?** True to start the server as https server (optional, default `{}`)
  - `httpsOptions.cert` **[string][16]?** The server cert
  - `httpsOptions.key` **[string][16]?** The server key
  - `httpsOptions.passphrase` **[string][16]?** The key's passphrase

Returns **(http | https)** nodejs http/https server

[1]: #bautajs-express
[2]: #how-to-install
[3]: #usage
[4]: #bautajsexpress
[5]: #parameters
[6]: #examples
[7]: #applymiddlewares
[8]: #parameters-1
[9]: #listen
[10]: #parameters-2
[11]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/
[12]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
[13]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
[14]: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md
[15]: ./lib/validators/api-definition-schema-json
[16]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String
[17]: https://github.com/isaacs/node-glob
[18]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function
[19]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[20]: #bautajsexpress
[21]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number