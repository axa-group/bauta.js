# bautajs-fastify-example

- This API example intends to show how you can use Bauta.js with Fastify.
- This project example purpose is to showcase main features using simple examples. 
- This project example **does not** intend to show good practices using Node.js or security practices at all. Please be sure you follow security good practices on your Node.js API (i.e. adding [helmet](@fastify/helmet)).

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


## Third party dependencies licenses

### Production
 - [@axa/bautajs-core@2.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@axa/bautajs-datasource-rest@2.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@axa/bautajs-decorator-cache@2.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@axa/bautajs-fastify@2.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [fastify@4.8.1](https://github.com/fastify/fastify) - MIT
