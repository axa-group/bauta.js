# API versioning

The `bautajs` has API versioning out of the box to version the services and datasources easily and with a good structure.

It's strongly recommended to follow the following structure for API versioning.
````
- services
  -- v1
    -- cats-resolver.js
  -- v2
    -- cats-resolver.js
````

```js
// v1/cats-resolver.js

module.exports = (services) => {
  services.v1.cats.find.push((_, ctx) => {
    return {
      name: 'toto'
    }
  })
}
```

```js
// v2/cats-resolver.js

module.exports = (services) => {
  services.v2.cats.find.push((_, ctx) => {
    return {
      id: 'toto'
    }
  })
}
```

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
    ]
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
    ]
  }
]
```

API versions are accesible by code after:

```js
// my-resolver.js
module.exports = (services) => {
  services.cats.v1.find.run();
  services.cats.v2.find.run();
}
```

In this example the `cats.v2` is inheriting automatically the behaviour of `cats.v1`

### Example of no inheritance

This is an example of API definitions for two API versions without inheritance:

-  Using the previous example api-definitions.json, we can specify on the v2 data source what we don't want to inherit:

```json
// v2-datasource.json
{
  "services": {
    "cats": {
      "operations": [
        {
          "id":"find",
          "inherit": false
        }
      ]
    }
  }
}
```

Then the two versions will have a different behaviour:

```js
// my-resolver.js
module.exports = (services) => {
  services.cats.v1.find.run();
  services.cats.v2.find.run(); // The result of this will be different from the v1
}
```

### Example of different datasources by version

This is an example of API definitions for two API versions without inheritance:

This will be the datasource for the different versions:

```js
const { restDataSource } = require('@bautajs/datasource-rest');

module.exports = restDataSource({
  "services": {
    "cats":{
      "operations":[
        {
          "id":"find",
          "options":{
            "url":"http://google.es"
          }
        },
        {
          "id":"find",
          "options":{
            "url":"http://facebook.es"
          },
          "version":"v2"
        }
      ]
    }
  }
});
```

So as you can see here the v1 `cats.find` will fetch the data from google.es and v2 will fetch data from facebook.com.
Datasources without `version` will be linked to the first api-definition version. Also, `version` must match with the API definition `info.version`.