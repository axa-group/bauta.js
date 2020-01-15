# Getting started

The goal of this section is to describe the OperatorFunctions required to have bautajs-express up and running in a sort of hello world example.

## Prerequisites
- An empty project
- Project already initialized (it has a package.json). ``npm init``
- A npm start script on the package.json with the command `node server.js`

## Step 1 Install bauta

```console
  npm install @bautajs/express @bautajs/core
```

## Step 2 Create a server file that uses bautajs/express

```js
const { BautaJSExpress } = require('@bautajs/express');
const apiDefinitions = {};
const apiOptions = {};
const bautJSExpress = new BautaJSExpress(apiDefinitions, apiOptions);
bautJSExpress.applyMiddlewares();
bautJSExpress.listen();
```

At this point, if you try to start the server, it will not work because api definitions are empty.

## Step 3 Configure api-definitions

The information about api definitions is [Here](./docs/api-definition.md).

Let's assume that we have the minimal empty with zero functionality api definitions (do not worry, it will grow to some usefulness later on). It could be in a separate file api-definitions.json with the following content:

```json
[
  {
    "openapi": "3.0.0",
    "info": {
      "version": "v1",
      "title": "Example API"
    },
    "servers": [
      {
        "url": "/api/v1/"
      }
    ],
    "paths": {
      "/greetings": {
        "get": {
          "summary": "be a polite greeting service",
          "operationId": "getGreetings",
          "responses": {
            "200": {
              "description": "polite greeting ok",
              "content": {
                "application/json": {
                  "schema": {}
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

There is a lot of information here, but let's focus only on two fields:

- first element inside ```paths``` element: In this case it has the value ```/greetings```. This is the subdomain of the service that we are exposing.
- operationId: This element has the value ```getGreetings```. It is a pointer to the right method that will implement the logic of our greeting operation.

Now let's modify slightly the server.js file:

```js
const { BautaJSExpress } = require('@bautajs/express');
const apiDefinitions = require('./api-definitions');
const apiOptions = {};
const bautJSExpress = new BautaJSExpress(apiDefinitions, apiOptions);
bautJSExpress.applyMiddlewares();
bautJSExpress.listen();
```

Finally, let's try again running the server with npm run start, and now it should work.

Now, only the endpoint '/greetings' will be exposed but because we don't have any implementation by default we will receive a not found error (HTTP Status code 404).

## Step 4 hello world implementation
Finally, we have to create or first resolver. Let's call this file resolver.js. So, let's do the following commands in the root of the project:

```console
mkdir server
cd server
mkdir resolvers
cd resolvers
mkdir hello-world
cd hello-world
touch resolver.js
```

Its content should be as follows:
```js
const { resolver } = require('@bautajs/core');
module.exports = resolver(operations =>
    operations.v1.getGreetings.setup(pipeline =>
      pipeline.pipe(() => ({
        message: 'hello world'
      }))
    )
  );
```

First of all, resolver decorator is only used in edition time, to allow the editor to show the signature of the different methods and
parameters. At this point it has no other usage in runtime and can be ignored for our explanations.

`operations` is the reference of all the operations for the middleware. From them, we have at the pointer `v1.getGreetings`  the version defined in the api definition and the id of the operation that must match the `operationId` in the api definition.
Finally, the setup method requires a pipeline parameter p, in which we push OperatorFunctions. Our pipeline is very simple and has only one OperatorFunction, that returns the message we desire.
If we have start the server and we call the method GET /api/v1/greetings now, as expected, we are greeted! 