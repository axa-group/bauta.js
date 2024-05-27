# API versioning

## Context

By API versioning we mean the fact that we can have a running server with two different versions of the same endpoint.

Let's assume that initially we have a service without any versioning whatsoever. This means that we have the following set of components:

- a swagger api definition with certain routes and operations defined
- a set of resolvers that implement those operations
- a bauta service that loads and exposes both swagger and resolvers.

In the context of bauta, for versioning we mean the capability to provide a subset of those api's in a different prefixed route with a different swagger.

This means that after versioning is applied we have the following:

- the original swagger api definition with certain routes and operations defined, some of them marked as deprecated
- the original set of resolvers that implement those operations
- a new swagger with certain new routes and operations defined in a different way 
- a new set of resolvers that implement these new operations
- a bauta service that loads and exposes both swagger and resolvers, for the original and for the new services.


## Configuration for versioning

For versioning to work there are three parts that **must** be configured in order to work. 

### 1. Swagger API definition

:exclamation: You **must** declare any existing route that you want to use as a new version as ``deprecated``.  :exclamation:

This is required to make sure that bautaJs does not overwrite the new version with the original route implementation.

Below there is an example of API definitions for two API versions (note: you may use two different swaggers and load each one of them separatedly):

```json
// api-definitions.json
[
  {
    "openapi": "3.0.0",
    "info": {
      "description": "A new API",
      "version": "v1",
      "title": "Cats API"
    },
    "servers": [
      {
        "url": "/v1/api/"
      }
    ],
    "paths": {
      "/cats": {
        "get": {
          "operationId": "findCat",
          "deprecated": true,   // <-- MUST mark it as deprecated if you want to use new version of the same route
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
        "url": "/v2/api/"
      }
    ],
    "paths": {
      "/cats": {
        "get": {
          "operationId": "findCatV2",
          "responses": {
            "200": {
              "description": "Miaw!",
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "petName": {  // Breaking change: petName instead of name in v1
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
  }
]  
```



#### Deprecation programmaticaly

Bautajs supports the deprecation by code with the resolver method `setAsDeprecated`. 

```js
const { resolver } = require('@axa/bautajs-core');
// my-resolver.js
module.exports = resolver(operations) => {
  operations.findCats.setAsDeprecated().setup(() => 'result');
}
```

While you may use this in a pinch we strongly suggest that you favour the deprecation of services at swagger level whenever possible.

In any case the deprecation of routes that you are versioning, either by swagger or programmatically, **is mandatory**.


### 2. Resolver resolution


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
// resolvers/v1/cats-resolver.js
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
// resolvers/v2/cats-resolver.js
const { resolver } = require('@axa/bautajs-core');
module.exports = resolver((operations) => {
  operations.findCatV2.setup((_, ctx) => {
    return {
      petName: 'toto'
    }
  });
})
```

### 3. BautaJS instantiation of both API versions

When you want to apply versioning, you have to modify slightly the way that bautaJs starts up to clearly configure what is considered the old version of your service endpoints and what is considered the latest version.

#### Example using Bauta.js core without a Node.js framework plugin

Now we need to specify a `bautaJS` instance per API swagger version.

```js
// instances.js
const { BautaJS } = require('@axa/bautajs-core');
const apiDefinition = require('./api-definitions.json');


const bautajsV1 = new BautaJS({
  apiDefinition: apiDefinitions[0],
  resolversPath: './resolvers/v1/cats-resolvers.js',
  prefix: '/v1/',
  apiBasePath: '/api/'
});
const bautajsV2 = new BautaJS({  
  apiDefinition: apiDefinitions[1],
  resolversPath: './resolvers/v2/cats-resolvers.js',
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
  // result:  petName: 'toto'

  console.log(res1, res2);
})()
```

In this example the `findCat` from v1 instance will be inherited to the v2 instance because of the usage of `inheritOperationsFrom` that will inherit the schema, the properties and the handler from v1.

**Calling setup method of any operation will override the current handler**

Calling `inheritOperationsFrom` after bootstrap the instance is not possible and will always throw an error. This behaviour is intended since api schema is resolved on bootstrap time so if the instance is already bootstrapped and `inheritOperationsFrom` is called after this could lead to unexpected behaviour of your API.


#### Example using Bauta.js with a @axa/bautajs-fastify plugin

##### Creating the Bauta.js instances and setting up the inheritance outside the plugin

```js
const { BautaJS } = require('@axa/bautajs-core');
const { bautajsFastify } = require('@axa/bautajs-fastify')

const apiDefinition = require('./api-definitions.json');

const bautajsV1 = new BautaJS({
  apiDefinition: apiDefinitions[0],
  resolversPath: './resolvers/v1/cats-resolvers.js', 
});
const bautajsV2 = new BautaJS({
  apiDefinition: apiDefinitions[1],
  resolversPath: './resolvers/v2/cats-resolvers.js', 
});

(async () => {
  await fastifyInstance
    .register(bautajsFastify, {
      bautajsInstance: bautajsV1,
      prefix: '/v1/',
      apiBasePath: '/api/'
    })
    .after(() => {
      bautajsV2.inheritOperationsFrom(bautajsV1);
      fastifyInstance.register(bautajsFastify, {
        bautajsInstance: bautajsV2,
        prefix: '/v2/',
        apiBasePath: '/api/'
      });
    });

  // It calls the operation resolver of the endpoint of v1
  const res1 = await bautajsV2.operations.findCat.run();
  // result:  name: 'toto'
  const res2 = await bautajsV2.operations.findCatV2.run();
  // result:  petName: 'toto'

  console.log(res1, res2);
})()
```

##### Creating the Bauta.js instances and setting up the inheritance with the plugin option 'inheritOperationsFrom'

```js
const { BautaJS } = require('@axa/bautajs-core');
const { bautajsFastify } = require('@axa/bautajs-fastify')

const apiDefinition = require('./api-definitions.json');

const bautajsV1 = new BautaJS({
  apiDefinition: apiDefinitions[0],
  resolversPath: './resolvers/v1/cats-resolvers.js' 
});

const bautajsV2 = new BautaJS({
  apiDefinition: apiDefinitions[1],
  resolversPath: './resolvers/v2/cats-resolvers.js'
});

(async () => {
  await fastifyInstance
    .register(bautajsFastify, {
      bautajsInstance: bautajsV1,
      prefix: '/v1/',
      apiBasePath: '/api/'
    })
    .after(() => {
      fastifyInstance.register(bautajsFastify, {
        bautajsInstance: bautajsV2,
        inheritOperationsFrom: bautajsV1,
        prefix: '/v2/',
        apiBasePath: '/api/'
      });
    });

  // It calls the operation resolver of the endpoint of v1
  const res1 = await bautajsV2.operations.findCat.run();
  // result:  name: 'toto'
  const res2 = await bautajsV2.operations.findCatV2.run();
  // result:  petName: 'toto'

  console.log(res1, res2);
})()
```

##### Creating only the parent Bauta.js instance and setting up the inheritance with the plugin option 'inheritOperationsFrom'

```js
const { BautaJS } = require('@axa/bautajs-core');
const { bautajsFastify } = require('@axa/bautajs-fastify')

const apiDefinition = require('./api-definitions.json');

const bautajsV1 = new BautaJS({
  apiDefinition: apiDefinitions[0],
  resolversPath: './resolvers/v1/cats-resolvers.js'  
});

(async () => {
  await fastifyInstance
    .register(bautajsFastify, {
      bautajsInstance: bautajsV1,
      prefix: '/v1/',
      apiBasePath: '/api/'
    })
    .after(() => {
      fastifyInstance.register(bautajsFastify, {        
        apiDefinition: apiDefinitions[1],
        resolversPath: './resolvers/v2/cats-resolvers.js',
        prefix: '/v2/',
        apiBasePath: '/api/',
        inheritOperationsFrom: bautajsV1
      });
    });

  // It calls the operation resolver of the endpoint of v1
  const res1 = await bautajsV2.operations.findCat.run();
  // result:  name: 'toto'
  const res2 = await bautajsV2.operations.findCatV2.run();
  // result:  petName: 'toto'

  console.log(res1, res2);
})()
```

Note about the examples: these are orientative examples, if you want to use them in a real case scenario, remember that you need
to start up the server accordingly (for instance, in `fastify` you have to listen to the plugin instance you have created and registered).



