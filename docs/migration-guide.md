# Migration Guide from 3.x.x to 4.x.x

### rest-datasource

Core package of rest-datasource [got](https://github.com/sindresorhus/got) it's updated from 10.x to 11.x and some breaking changes has been introduced.
You can find all the breaking changes on https://github.com/sindresorhus/got/releases/tag/v11.0.0.

Some of the most important changes are:

- Proxy Agent

```
{
-    agent: new https.Agent({keepAlive: true})
}

{
+    agent: {
+        http: new http.Agent({keepAlive: true}),
+        https: new https.Agent({keepAlive: true}),
+        http2: new http2wrapper.Agent()
+    }
}
```

- The error.request property is no longer a ClientRequest instance. Instead, it gives a Got stream, which provides a set of useful properties.
const got = require('got');

(async () => {
    try {
        await got('https://sindresorhus.com/notfound');
    } catch (error) {
        console.log(`Request failed: ${error.message}`);
        console.log('Download progress:', error.request.downloadProgress);
    }
})();

