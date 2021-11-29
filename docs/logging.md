# Logging

One of the main purpose of `bautajs` is provide a nice logging experience. Bauta.js provides a default logger (pino).

It can be overwritten by a custom logger passed on the initizalition of the Bauta.js instance. This log must follow the standard specified on [abstract-logging](https://www.npmjs.com/package/abstract-logging).

```js
const bautaJS = new BautaJS({
        apiDefinition: apiDefinitionJson,
        staticConfig: config,
        logger: myCustomLogger
      });
```

When a request is trigger againts our Bauta.js API the information logged is like the following:

```console
[2022-01-26 09:06:46.305 +0000] INFO (processName on serverName): incoming request
    req: {
      "method": "GET",
      "url": "/metrics",
      "query": {},
    }
    reqId: "A3yEuDD0Sba6ZvsSHurvgw/359"
[2022-01-26 09:06:46.309 +0000] INFO (processName on serverName): request completed
    res: {
      "statusCode": 200
    }
    responseTime: 3.860149998217821
    reqId: "A3yEuDD0Sba6ZvsSHurvgw/359"
```
