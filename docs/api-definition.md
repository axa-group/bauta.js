# API definition

`bautajs` uses [OpenAPI definition v2 or v3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md) to create the operations structure, to validate requests, to validate responses, to expose a Swagger UI and to expose your API paths.

**By default the base path of the exposed endpoints will be the first url on "servers" for OpenAPI V3 or the "basePath" for Swagger 2.0**

### Example of OpenAPI v3

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
  }
]
```

The following operations structure will be generated with the given OpenAPI file:

`bautajs.operations[OPEN_API.info.version][OPEN_API.paths[x][METHOD].operationId]`

Accessing to the operations via:

```js
 bautajs.operations.v1.findCat
```