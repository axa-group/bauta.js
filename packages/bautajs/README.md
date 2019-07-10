## bautajs/core

A library to build easy versionable and self organized middlewares.


## How to install

Make sure that you have access to [Artifactory][https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/]

```console
  npm install @bautajs/core
```


## Usage

To use bautaJS with the default configuration we will need to create the following folder structure:

-   server
    -   services
        -   v1
            -   cats
                -   cats-datasource.js
                -   cats-resolver.js
    -   server.js
    -   api-definitions.json

// cats-datasource.json

```js
const { dataSource } = require('@bautajs/core');

module.exports = dataSource({
  "services": {
    "cats": {
      "operations": [
        {
          "id": "find",
          options(_, ctx, $static): {
            return {
              url: `${$static.config.endpoint}/getsome`
            }
          }
        }
      ]
    }
  }
})
```

// cats-resolver.js

```js
  const { compileDataSource } = require('@bautajs/decorators');
  const { resolver } = require('@bautajs/core');
  const catsSchema = require('./cats-schema.json');

  module.exports = resolver(services => {
    services.cats.v1.find
      .setup(p => 
        p.push(compileDataSource((_, ctx) => {
          ctx.logger.info('Fetching some cats');

          return ctx.dataSource.request();
        }))
      )
  });
```

// api-definitions.json

```json
  [
    {
      "openapi": "3.0",
      "apiVersion": "1.0",
      "swaggerVersion": "1.0",
      "info": {
        "description": "API for cool cats",
        "version": "v1",
        "title": "My API"
      },
      "servers": [{
        "url":"/v1/api/"
      }],
      "paths": {
        "/cats": {
          "get": {
            "tags": ["cats"],
            "summary": "Get the list of cats",
            "operationId": "find",
            "produces": ["application/json"],
            "responses": {
              "200": {
                "description": "successful operation",
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "Object",
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
  ]
```

// server.js

```js
    const BautaJS = require('@bautajs/core');
    const apiDefinitions = require('./api-definitions.json');

    const bautaJS = new BautaJS(apiDefinitions, {
      dataSourceStatic: {
        config: {
          endpoint:'http://coolcats.com'
        }
      }
    });

    await bautaJS.services.cats.v1.find.run({});
```

This will produce a request to `coolcats.com` with the result:

```json
  [
    {
      "name": "cat1"
    }
  ]
```