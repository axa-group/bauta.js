# bautajs-express-example

- This API example intends to show how you can use Bauta.js with Express.js.
- This project example purpose is to showcase main features using simple examples. 
- This project example **does not** intend to show good practices using Node.js or security practices at all. Please be sure you follow security good practices on your Node.js API (i.e. adding [helmet](https://www.npmjs.com/package/helmet)).

## List of exposed Services

- GET `/api/articles`
  - Returns a list of articles  
- GET `/api/chuckfacts/{string}`
  - Returns a list of chuckfacts from the string
  - Shows how to use the cache decorator in a resolver
- GET `/api/cats`
  - Returns a list of cat facts
- GET `/api/minimap`
  - Returns an object with all the defined key-values
- GET `/api/minimap/${key}`
  - Returns an object with the found key-value. 
- POST `api/minimap`
  - Allows to store a key-value pair into the minimap
- GET `api/randomYear`
  - Returns a string with a fact from a random year
- GET `api/randomYear2`
  - Returns an object with a fact from a random year
- GET `api/factNumber/{number}`
  - Returns a string with a random fact from the input number
- GET `api/factNumber2/{number}`
  - Returns an object with a random fact from the input number


## Custom Logger example

Out of the box bauta.js express example comes with the default logger. We provide a non default logger example in the file bauta-with-custom-logger.js.

If you want to use it, just modify server.js and change the require from bautaJS variable from current value to the custom-logger-bauta.js:

```js
const bautaJS = require('./server/instances/bauta');
```

change it to:

```js
const bautaJS = require('./server/instances/bauta-with-custom-logger');
```

With this change it a custom logger, defined in custom-logger-bauta.js, is used by bauta.js instead of the default one.

## Third party dependencies licenses

### Production
 - [@axa/bautajs-core@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@axa/bautajs-datasource-rest@1.0.0](https://github.com/axa-group/bauta.js) - MIT* 
 - [@axa/bautajs-express@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@hapi/boom@10.0.0](https://github.com/hapijs/boom) - BSD-3-Clause
 - [express@4.18.1](https://github.com/expressjs/express) - MIT
 - [pino@8.4.2](https://github.com/pinojs/pino) - MIT
 - [pino-pretty@9.1.0](https://github.com/pinojs/pino-pretty) - MIT
