## BautaJS datasource REST

A rest datasource of providers for `bautajs`.
It allows to do requests to third party APIs using [got](https://github.com/sindresorhus/got) and include it on the pipeline.


## How to install

```console
  npm install @bautajs/datasource-rest
```

## Features

- Logs on response and requests via the `bautajs` context logger.
- Proxy Agent with no_proxy and http_proxy env variables support [native-proxy-agent](https://github.axa.com/Digital/native-proxy-agent).
- Add `x-request-id` on every request done coming from the `bautajs` context.id.
- Request (promise and stream) cancellation perfectly integrated with `@bautajs/*` client cancellation events.
- Stream and buffer request and response body logs are simplified into their size.
- Truncated request and response body.

## Usage

Create the datasource

```js
  // my-datasource.js
const { getRequest } = require('@bautajs/express');
const { restProvider } = require('@bautajs/datasource-rest');

module.exports.testProvider = restProvider((client, _, ctx, bautajs) => {
  const req = getRequest(ctx);
  const acceptLanguage = !req.headers.accept-language? 'my default lang' : req.headers['accept-language'];

  return client.get(bautajs.staticConfig.config.url, {
    headers: {
      "Accept-Language": acceptLanguage,
      "user-agent": req.headers['user-agent']
    }
  })
});
```

```js
// my-resolver.js
const { resolver } = require('@bautajs/express');
const { testProvider } = require('./my-datasource');

module.exports = resolver((operations) => {
  operations.v1.findCats.setup(p => 
    p.pipe(testProvider())
  )
});
```

### Create your own restProvider

```js
  // my-datasource.js
const { getRequest } = require('@bautajs/express');
const { restProvider } = require('@bautajs/datasource-rest');

const myTextProvider = restProvider.extend({ responseType: 'text' });

module.exports.testProvider = myTextProvider((client, _, ctx, bautajs) => {
  const req = getRequest(ctx);
  const acceptLanguage = !req.headers.accept-language? 'my default lang' : req.headers['accept-language'];

  return client.get(bautajs.staticConfig.config.url, {
    headers: {
      "Accept-Language": acceptLanguage,
      "user-agent": req.headers['user-agent']
    }s
  })
});
```

See more examples on [Datasources](../../docs/datasources.md)

## Contributing

You can read the guide of how to contribute at [Contributing](../../CONTRIBUTING.md).

## Code of Conduct

You can read the Code of Conduct at [Code of Conduct](../../CODE_OF_CONDUCT.md).

## Who is behind it?

This project is developed by AXA Group Operations Spain S.A.

### License

Copyright (c) AXA Group Operations Spain S.A.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
## Third party dependencies licenses

### Production
 - [@bautajs/core@5.1.0](git+https://github.axa.com/Digital/bauta-nodejs) - MIT*
 - [@sindresorhus/is@4.0.1](https://github.com/sindresorhus/is) - MIT
 - [got@11.8.2](https://github.com/sindresorhus/got) - MIT
 - [native-proxy-agent@2.5.0](git+https://github.axa.com/Digital/native-proxy-agent) - MIT*

### Development
