# API versioning

`bautajs` has API versioning out of the box to version your API operations.

As `bautajs` is loading all files under ./resolvers file by default, it's recommended to follow the next folder structure, remember you can change this default path by other one.
````
- resolvers
  -- v1
    -- cats-resolver.js
  -- v2
    -- cats-resolver.js
````

```js
// v1/cats-resolver.js
const { resolver } = require('@bautajs/core');
module.exports = resolver((operations) => {
  operations.v1.findCat.push((_, ctx) => {
    return {
      name: 'toto'
    }
  })
})
```

```js
// v2/cats-resolver.js
const { resolver } = require('@bautajs/core');
module.exports = resolver((operations) => {
  operations.v2.findCat.push((_, ctx) => {
    return {
      id: 'toto'
    }
  })
})
```

- To find out how to use push, take a look to its [documentation](./step-and-resolver.md)

### Example

This is an example of API definitions for two API versions:

```json
// api-definitions.json
[
  {
    "openapi": "3.0.0",
    "apiVersion": "1.0",
    "info": {
      "description": "A new API",
      "version": "v1",
      "title": "CORE API"
    },
    "servers": [
      {
        "url":"/v1/api/"
     }
    ],
    "paths": {
      "/cats": {
        "get":{
          "operationId":"findCat"
        }
      }
    }
  },
  {
    "openapi": "3.0.0",
    "apiVersion": "2.0",
    "info": {
      "description": "A new API",
      "version": "v2",
      "title": "CORE API"
    },
    "servers": [
      {
        "url":"/v1/api/"
     }
    ],
    "paths": {
      "/cats": {
        "get":{
          "operationId":"findCat"
        }
      }
    }
  }
]
```

API versions are now accesible by code:
**See that the operations structure is the following bautajs.operations[OPEN_API.info.version][OPEN_API.paths[x][METHOD].operationId]**

```js
// server.js
const { BautaJSExpress } = require('@bautajs/express');
const apiDefinition = require('./api-definitions.json');


const bautajs = new BautaJSExpress(apiDefinition);

const res1 = await bautajs.operations.v1.findCat.run();

const res2 = await bautajs.operations.v2.findCat.run();

console.log(res1, res2);

```

In this example the `cats.v2` is inheriting automatically the behaviour of `cats.v1`.

**Calling setup method from v2 will override the v2 pipeline inherited from v1**

### Deprecate an operation

A deprecated operation means that his behaviour or (pipeline) won't be inherited by the next API versions.
There are two ways for deprecate an operation; by code or by the OpenAPI definition.

- Deprecation by code:
```js
const { resolver } = require('@bautajs/core');
// my-resolver.js
module.exports = resolver(operations) => {
  operations.v1.findCats.setAsDeprecated().setup((p) => p.push(() => 'result'));
}
```

- Deprecation by OpenAPI file

```json
// api-definitions.json
[
  {
    "openapi": "3.0.0",
    "apiVersion": "1.0",
    "info": {
      "description": "A new API",
      "version": "v1",
      "title": "CORE API"
    },
    "servers": [
      {
        "url":"/v1/api/"
     }
    ],
    "paths": {
      "/cats": {
        "get":{
          "operationId":"findCat",
          "deprecated": true
        }
      }
    }
  },
  {
    "openapi": "3.0.0",
    "apiVersion": "2.0",
    "info": {
      "description": "A new API",
      "version": "v2",
      "title": "CORE API"
    },
    "servers": [
      {
        "url":"/v1/api/"
     }
    ],
    "paths": {
      "/cats": {
        "get":{
          "operationId":"findCat"
        }
      }
    }
  }
]
```

