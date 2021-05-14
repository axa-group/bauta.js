# API definition

`bautajs` uses [OpenAPI definition v2 or v3](https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.0.md)  to validate requests, to validate responses, to expose a Swagger UI and to expose your API paths.

### Example of OpenAPI v3

```json
// api-definition.json

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
```

Having this swagger the following operation association will be done:

`bautajs.operations[OPEN_API.paths[x][METHOD].operationId]`

Accessing to the operations via:

```js
 bautajs.operations.findCat
```

That way operationId findCat schema will be associated with the operation 'key' findCat.

**Providing a API definition is not mandatory on create a Bautajs instance**