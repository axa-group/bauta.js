# API versioning

Bauta.js has API versioning out of the box to version your API operations.

As Bauta.js is loading all files under ./resolvers file by default, it's recommended to follow the next folder structure, remember you can change this default path by other one.

```console
- resolvers
  -- v1
    -- cats-resolver.js
  -- v2
    -- cats-resolver.js
```

```js
// v1/cats-resolver.js
const { resolver } = require('@axa/bautajs-core');
module.exports = resolver((operations) => {
  operations.findCat.setup((_, ctx) => {
    return {
      name: 'toto'
    }
  });
})
```

```js
// v2/cats-resolver.js
const { resolver } = require('@axa/bautajs-core');
module.exports = resolver((operations) => {
  operations.findCatV2.setup((_, ctx) => {
    return {
      idV2: 'toto'
    }
  });
})
```

This is an example of API definitions for two API versions:

```json
// api-definitions.json
  [  {
    "openapi": "3.0.0",
    "info": {
      "description": "A new API",
      "version": "v1",
      "title": "Cats API"
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
          "responses": {
            "200": {
              "description": "Miau!",
              "content": {
                "application/json": {
                  "schema": {
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
  },
  {
    "openapi": "3.0.0",
    "info": {
      "description": "A new API",
      "version": "v2",
      "title": "Cats API"
    },
    "servers": [
      {
        "url":"/v2/api/"
     }
    ],
    "paths": {
      "/cats": {
        "get":{
          "operationId":"findCatV2",
          "responses": {
            "200": {
              "description": "Miaw!",
              "content": {
                "application/json": {
                    "schema": {
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
  }]
```

### Example using Bauta.js core without a Node.js framework plugin

Now we need to specify a `bautaJS` instance per API swagger version.

```js
// instances.js
const { BautaJS } = require('@axa/bautajs-core');
const apiDefinition = require('./api-definitions.json');


const bautajsV1 = new BautaJS({
  apiDefinition: apiDefinitions[0],
  prefix: '/v1/',
  apiBasePath: '/api/'
});
const bautajsV2 = new BautaJS({
  apiDefinition: apiDefinitions[1],
  prefix: '/v2/',
  apiBasePath: '/api/'
});


(async () => {
  await bautajsV1.bootstrap();
  // Inherit v1 operations
  bautajsV2.inheritOperationsFrom(bautajsV1);
  await bautajsV2.bootstrap();

  // It calls the operation resolver of the endpoint of v1
  const res1 = await bautajsV2.operations.findCat.run();
  // result:  name: 'toto'
  const res2 = await bautajsV2.operations.findCatV2.run();
  // result:  idV2: 'toto'

  console.log(res1, res2);
})()
```

In this example the `findCat` from v1 instance will be inherited to the v2 instance because of the usage of `inheritOperationsFrom` that will inherit the schema, the properties and the handler from v1.

**Calling setup method of any operation will override the current handler**

Calling `inheritOperationsFrom` after bootstrap the instance is not possible and will always throw an error. This behaviour is intended since api schema is resolved on bootstrap time so if the instance is already bootstrapped and `inheritOperationsFrom` is called after this could lead to unexpected behaviour of your API.

### Example using Bauta.js with a @axa/bautajs-fastify plugin

#### Creating the Bauta.js instances and setting up the inheritance outside the plugin

```js
const { BautaJS } = require('@axa/bautajs-core');
const { bautajsFastify } = require('@axa/bautajs-fastify')

const apiDefinition = require('./api-definitions.json');

const bautajsV1 = new BautaJS({
  apiDefinition: apiDefinitions[0],
  prefix: '/v1/',
  apiBasePath: '/api/'
});
const bautajsV2 = new BautaJS({
  apiDefinition: apiDefinitions[1],
  prefix: '/v2/',
  apiBasePath: '/api/'
});

(async () => {
  await fastifyInstance
    .register(bautajsFastify, {
      bautajsInstance: bautajsV1
    })
    .after(() => {
      bautajsV2.inheritOperationsFrom(bautajsV1);
      fastifyInstance.register(bautajsFastify, {
        bautajsInstance: bautajsV2
      });
    });

  // It calls the operation resolver of the endpoint of v1
  const res1 = await bautajsV2.operations.findCat.run();
  // result:  name: 'toto'
  const res2 = await bautajsV2.operations.findCatV2.run();
  // result:  idV2: 'toto'

  console.log(res1, res2);
})()
```

#### Creating the Bauta.js instances and setting up the inheritance with the plugin option 'inheritOperationsFrom'

```js
const { BautaJS } = require('@axa/bautajs-core');
const { bautajsFastify } = require('@axa/bautajs-fastify')

const apiDefinition = require('./api-definitions.json');

const bautajsV1 = new BautaJS({
  apiDefinition: apiDefinitions[0],
  prefix: '/v1/',
  apiBasePath: '/api/'
});
const bautajsV2 = new BautaJS({
  apiDefinition: apiDefinitions[1],
  prefix: '/v2/',
  apiBasePath: '/api/'
});

(async () => {
  await fastifyInstance
    .register(bautajsFastify, {
      bautajsInstance: bautajsV1
    })
    .after(() => {
      fastifyInstance.register(bautajsFastify, {
        bautajsInstance: bautajsV2,
        inheritOperationsFrom: bautajsV1
      });
    });

  // It calls the operation resolver of the endpoint of v1
  const res1 = await bautajsV2.operations.findCat.run();
  // result:  name: 'toto'
  const res2 = await bautajsV2.operations.findCatV2.run();
  // result:  idV2: 'toto'

  console.log(res1, res2);
})()
```

#### Creating only the parent Bauta.js instance and setting up the inheritance with the plugin option 'inheritOperationsFrom'

```js
const { BautaJS } = require('@axa/bautajs-core');
const { bautajsFastify } = require('@axa/bautajs-fastify')

const apiDefinition = require('./api-definitions.json');

const bautajsV1 = new BautaJS({
  apiDefinition: apiDefinitions[0],
  prefix: '/v1/',
  apiBasePath: '/api/'
});

(async () => {
  await fastifyInstance
    .register(bautajsFastify, {
      bautajsInstance: bautajsV1
    })
    .after(() => {
      fastifyInstance.register(bautajsFastify, {
        apiDefinition: apiDefinitions[1],
        prefix: '/v2/',
        apiBasePath: '/api/'
        inheritOperationsFrom: bautajsV1
      });
    });

  // It calls the operation resolver of the endpoint of v1
  const res1 = await bautajsV2.operations.findCat.run();
  // result:  name: 'toto'
  const res2 = await bautajsV2.operations.findCatV2.run();
  // result:  idV2: 'toto'

  console.log(res1, res2);
})()
```

### Example using Bauta.js with a @axa/bautajs-express plugin

TBD


## Deprecate an operation

A deprecated operation means that on call `inheritOperationsFrom` method that operation won't be `cloned` to the new instance.

#### Deprecation programmaticaly

```js
const { resolver } = require('@axa/bautajs-core');
// my-resolver.js
module.exports = resolver(operations) => {
  operations.findCats.setAsDeprecated().setup(() => 'result');
}
```

#### Deprecation by OpenAPI swagger schema

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
