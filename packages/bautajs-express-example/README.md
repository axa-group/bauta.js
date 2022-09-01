# bautajs-express-example

- This API example intends to show how you can use Bauta.js with Express.js.
- This project example purpose is to showcase main features using simple examples. 
- This project example **does not** intend to show good practices using Node.js or security practices at all. Please be sure you follow security good practices on your Node.js API (i.e. adding [helmet](https://www.npmjs.com/package/helmet)).

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

This is a very simple case that allows you to see how you can easily use a custom logger, defined in custom-logger-bauta.js instead of the one used by default.


## Third party dependencies licenses

### Production
 - [@axa/bautajs-core@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@axa/bautajs-datasource-rest@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@axa/bautajs-decorator-cache@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@axa/bautajs-express@1.0.0](https://github.com/axa-group/bauta.js) - MIT*
 - [@hapi/boom@10.0.0](https://github.com/hapijs/boom) - BSD-3-Clause
 - [express@4.18.1](https://github.com/expressjs/express) - MIT
 - [pino@8.4.2](https://github.com/pinojs/pino) - MIT
 - [pino-pretty@9.1.0](https://github.com/pinojs/pino-pretty) - MIT
