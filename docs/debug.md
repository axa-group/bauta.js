# Logging

One of the main purpose of `bautajs` is provide a nice logging experience. 
The request options, the response body and the times a request takes are logged.

Bauta exposes a logger, that can be overwritten by a custom logger that can be
passed at creation time using the options field logger. 

The only requirement that a custom logger has to be is to implement the standard log
levels: fatal, error, warn, info, debug, trace. You can implement further custom log
levels but if any of those are missing you will not be able to use it. 

This is how you would pass a logger to bauta:

```js
const bautaJS = new BautaJS(apiDefinitionsJson as Document[], {
        staticConfig: config,
        logger: myCustomLogger
      });
```


# Debug

One of the main purpose of `bautajs` is provide a nice debugging experience. 
The request options, the response body and the times a request takes are logged.
To activate the logs just set debug:

```cmd
LOG_LEVEL=debug DEBUG=bautajs*
```

Log only one of the `butajs` submodules
```cmd
LOG_LEVEL=debug DEBUG=bautajs-datasource-rest*
```

Furthemore, if you want to censor some words we strongly recomend use [pino redaction][https://github.com/pinojs/pino/blob/master/docs/redaction.md].

As `batuajs` is using [Debug module](https://github.com/visionmedia/debug) you can use [pino-debug](https://github.com/pinojs/pino-debug) to wrap the logs into pino logs.

```js
// Example of the logger wrapper

let pinoDebug;
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line global-require
  pinoDebug = require('pino-debug');
}
const pino = require('pino');

// init logger
const config = {
  level: process.env.LOG_LEVEL || 'warn',
  name: 'my-api',
  prettyPrint: process.env.LOG_PRETTY !== 'false' ? { translateTime: true } : false
};

// pino.destination(1) (STDOUT)
const logger = pino(config, pino.destination(1));
// Set the logger to the myaxa assets
if (process.env.NODE_ENV !== 'test') {
  const debugModule = process.env.DEBUG || '*';
  const modules = debugModule.split(',');
  const map = modules.reduce((acc, mod) => {
    acc[`${mod}:warn`] = 'warn';
    acc[`${mod}:info`] = 'info';
    acc[`${mod}:debug`] = 'debug';
    acc[`${mod}:error`] = 'error';

    return acc;
  }, {});
  pinoDebug(logger, {
    auto: true,
    map
  });
}

module.exports = logger;

```
