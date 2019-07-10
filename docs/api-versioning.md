# Versioning
 
 On `bautajs` there is two kinds of versionings:
  - Api versioning
  - Datasource versioning

## API versioning 

 With `bautajs` you have an automatically API versioning using the OpenAPI file. This versioning will be reflected on the API interface by different paths.
 
 The version path will be build using the OpenAPI.info.version parameter of your OpenAPI file. An example of OpenAPI file will be:

 ```json
  [
   {
      "openapi": "3.0.0",
      "info": {
        "version": "v1",
        "title": "Swagger Petstore",
        "license": {
          "name": "MIT"
        }
      },
      "servers": [
        {
          "url": "http://petstore.swagger.io/v1"
        }
      ]
    }
  ]
 ```

 This file will produce the api path: `/api/v1` and the operations path `services.cats.v1.`

 To add another API version just add a new OpenAPI definition on the array:

 ```json
  [
   {
      "openapi": "3.0.0",
      "info": {
        "version": "v1",
        "title": "Swagger Petstore",
        "license": {
          "name": "MIT"
        }
      },
      "servers": [
        {
          "url": "http://petstore.swagger.io/v1"
        }
      ]
    },
    {
      "openapi": "3.0.0",
      "info": {
        "version": "v2",
        "title": "Swagger Petstore",
        "license": {
          "name": "MIT"
        }
      },
      "servers": [
        {
          "url": "http://petstore.swagger.io/v1"
        }
      ]
    }
  ]
 ```

## Datasource versioning

  The datasource can also be versioned, by default a datasource without version will be associated to the first OpenAPI definition on your `api-definitions.json` file. to apply the versioning also on a datasource you have to specify the parameter `version` on the datasource with the version you want to associate of your OpenAPI definition.

  Given the following api-definitions.json
   ```json
  [
   {
      "openapi": "3.0.0",
      "info": {
        "version": "v1",
        "title": "Swagger Petstore",
        "license": {
          "name": "MIT"
        }
      },
      "servers": [
        {
          "url": "http://petstore.swagger.io/v1"
        }
      ]
    },
    {
      "openapi": "3.0.0",
      "info": {
        "version": "v2",
        "title": "Swagger Petstore",
        "license": {
          "name": "MIT"
        }
      },
      "servers": [
        {
          "url": "http://petstore.swagger.io/v1"
        }
      ]
    }
  ]
 ```

 To associate a datasource to the version v2, just simply add:
 ```js
  const { dataSource } = require('@bautajs/core');

  module.exports = dataSource({
    services:{
      cats:{
        operations:[
          {
            id:'1',
            runner() {
              return 'hello';
            }
          },
          {
            id:'2',
            version: 'v2',
            runner() {
              return 'bye'
            }
          }
        ]
      }
    }
  });
 ```






