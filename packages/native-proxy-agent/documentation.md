## Native Proxy Agent

A native proxy agent that uses the native nodejs http.Agent and https.Agent to proxy the requests, no dependencies


## How to install

Make sure that you have access to [Artifactory][1]

```console
  npm install native-proxy-agent
```

## Usage

```js
const { createAgent } = require('native-proxy-agent');
const got = require('got');

 got('http://requestUrl.com/service/1', { agent : createAgent('http://requestUrl.com/service/1') });
```

[1]: https://axags.jfrog.io/axags/api/npm/virtual-bcn-node/
