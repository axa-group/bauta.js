[native-proxy-agent](../README.md) > [HttpsProxy](../interfaces/httpsproxy.md)

# Interface: HttpsProxy

## Hierarchy

 `ConnectionOptions`

**↳ HttpsProxy**

## Index

### Properties

* [ALPNProtocols](httpsproxy.md#alpnprotocols)
* [NPNProtocols](httpsproxy.md#npnprotocols)
* [auth](httpsproxy.md#auth)
* [ca](httpsproxy.md#ca)
* [cert](httpsproxy.md#cert)
* [checkServerIdentity](httpsproxy.md#checkserveridentity)
* [ciphers](httpsproxy.md#ciphers)
* [clientCertEngine](httpsproxy.md#clientcertengine)
* [crl](httpsproxy.md#crl)
* [dhparam](httpsproxy.md#dhparam)
* [ecdhCurve](httpsproxy.md#ecdhcurve)
* [headers](httpsproxy.md#headers)
* [honorCipherOrder](httpsproxy.md#honorcipherorder)
* [host](httpsproxy.md#host)
* [key](httpsproxy.md#key)
* [lookup](httpsproxy.md#lookup)
* [maxVersion](httpsproxy.md#maxversion)
* [minDHSize](httpsproxy.md#mindhsize)
* [minVersion](httpsproxy.md#minversion)
* [passphrase](httpsproxy.md#passphrase)
* [path](httpsproxy.md#path)
* [pfx](httpsproxy.md#pfx)
* [port](httpsproxy.md#port)
* [protocol](httpsproxy.md#protocol)
* [rejectUnauthorized](httpsproxy.md#rejectunauthorized)
* [secureContext](httpsproxy.md#securecontext)
* [secureOptions](httpsproxy.md#secureoptions)
* [secureProtocol](httpsproxy.md#secureprotocol)
* [servername](httpsproxy.md#servername)
* [session](httpsproxy.md#session)
* [sessionIdContext](httpsproxy.md#sessionidcontext)
* [socket](httpsproxy.md#socket)
* [timeout](httpsproxy.md#timeout)

---

## Properties

<a id="alpnprotocols"></a>

### `<Optional>` ALPNProtocols

**● ALPNProtocols**: *`string`[] \| `Buffer`[] \| `Uint8Array`[] \| `Buffer` \| `Uint8Array`*

*Inherited from ConnectionOptions.ALPNProtocols*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:268*

___
<a id="npnprotocols"></a>

### `<Optional>` NPNProtocols

**● NPNProtocols**: *`string`[] \| `Buffer`[] \| `Uint8Array`[] \| `Buffer` \| `Uint8Array`*

*Inherited from ConnectionOptions.NPNProtocols*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:267*

___
<a id="auth"></a>

### `<Optional>` auth

**● auth**: *`any`*

*Defined in [types.ts:26](https://github.axa.com/Digital/bauta-nodejs/blob/f67fbfa/packages/native-proxy-agent/src/types.ts#L26)*

___
<a id="ca"></a>

### `<Optional>` ca

**● ca**: *`string` \| `Buffer` \| `Array`<`string` \| `Buffer`>*

*Inherited from SecureContextOptions.ca*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:344*

___
<a id="cert"></a>

### `<Optional>` cert

**● cert**: *`string` \| `Buffer` \| `Array`<`string` \| `Buffer`>*

*Inherited from SecureContextOptions.cert*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:343*

___
<a id="checkserveridentity"></a>

### `<Optional>` checkServerIdentity

**● checkServerIdentity**: *`undefined` \| `checkServerIdentity`*

*Inherited from ConnectionOptions.checkServerIdentity*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:269*

___
<a id="ciphers"></a>

### `<Optional>` ciphers

**● ciphers**: *`undefined` \| `string`*

*Inherited from SecureContextOptions.ciphers*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:345*

___
<a id="clientcertengine"></a>

### `<Optional>` clientCertEngine

**● clientCertEngine**: *`undefined` \| `string`*

*Inherited from SecureContextOptions.clientCertEngine*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:348*

___
<a id="crl"></a>

### `<Optional>` crl

**● crl**: *`string` \| `Buffer` \| `Array`<`string` \| `Buffer`>*

*Inherited from SecureContextOptions.crl*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:349*

___
<a id="dhparam"></a>

### `<Optional>` dhparam

**● dhparam**: *`string` \| `Buffer`*

*Inherited from SecureContextOptions.dhparam*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:350*

___
<a id="ecdhcurve"></a>

### `<Optional>` ecdhCurve

**● ecdhCurve**: *`undefined` \| `string`*

*Inherited from SecureContextOptions.ecdhCurve*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:347*

___
<a id="headers"></a>

### `<Optional>` headers

**● headers**: *`any`*

*Defined in [types.ts:25](https://github.axa.com/Digital/bauta-nodejs/blob/f67fbfa/packages/native-proxy-agent/src/types.ts#L25)*

___
<a id="honorcipherorder"></a>

### `<Optional>` honorCipherOrder

**● honorCipherOrder**: *`undefined` \| `false` \| `true`*

*Inherited from SecureContextOptions.honorCipherOrder*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:346*

___
<a id="host"></a>

### `<Optional>` host

**● host**: *`undefined` \| `string`*

*Inherited from ConnectionOptions.host*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:262*

___
<a id="key"></a>

### `<Optional>` key

**● key**: *`string` \| `Buffer` \| `Array`<`Buffer` \| `Object`>*

*Inherited from SecureContextOptions.key*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:341*

___
<a id="lookup"></a>

### `<Optional>` lookup

**● lookup**: *`net.LookupFunction`*

*Inherited from ConnectionOptions.lookup*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:274*

___
<a id="maxversion"></a>

### `<Optional>` maxVersion

**● maxVersion**: *`SecureVersion`*

*Inherited from SecureContextOptions.maxVersion*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:359*

Optionally set the maximum TLS version to allow. One of `TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`. Cannot be specified along with the `secureProtocol` option, use one or the other. **Default:** `'TLSv1.2'`.

___
<a id="mindhsize"></a>

### `<Optional>` minDHSize

**● minDHSize**: *`undefined` \| `number`*

*Inherited from ConnectionOptions.minDHSize*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:272*

___
<a id="minversion"></a>

### `<Optional>` minVersion

**● minVersion**: *`SecureVersion`*

*Inherited from SecureContextOptions.minVersion*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:369*

Optionally set the minimum TLS version to allow. One of `TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`. Cannot be specified along with the `secureProtocol` option, use one or the other. It is not recommended to use less than TLSv1.2, but it may be required for interoperability. **Default:** `'TLSv1.2'`, unless changed using CLI options. Using `--tls-v1.0` changes the default to `'TLSv1'`. Using `--tls-v1.1` changes the default to `'TLSv1.1'`.

___
<a id="passphrase"></a>

### `<Optional>` passphrase

**● passphrase**: *`undefined` \| `string`*

*Inherited from SecureContextOptions.passphrase*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:342*

___
<a id="path"></a>

### `<Optional>` path

**● path**: *`undefined` \| `string`*

*Inherited from ConnectionOptions.path*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:264*

___
<a id="pfx"></a>

### `<Optional>` pfx

**● pfx**: *`string` \| `Buffer` \| `Array`<`string` \| `Buffer` \| `Object`>*

*Inherited from SecureContextOptions.pfx*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:340*

___
<a id="port"></a>

### `<Optional>` port

**● port**: *`undefined` \| `number`*

*Inherited from ConnectionOptions.port*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:263*

___
<a id="protocol"></a>

### `<Optional>` protocol

**● protocol**: *`undefined` \| `string`*

*Defined in [types.ts:27](https://github.axa.com/Digital/bauta-nodejs/blob/f67fbfa/packages/native-proxy-agent/src/types.ts#L27)*

___
<a id="rejectunauthorized"></a>

### `<Optional>` rejectUnauthorized

**● rejectUnauthorized**: *`undefined` \| `false` \| `true`*

*Inherited from ConnectionOptions.rejectUnauthorized*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:266*

___
<a id="securecontext"></a>

### `<Optional>` secureContext

**● secureContext**: *`SecureContext`*

*Inherited from ConnectionOptions.secureContext*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:273*

___
<a id="secureoptions"></a>

### `<Optional>` secureOptions

**● secureOptions**: *`undefined` \| `number`*

*Inherited from SecureContextOptions.secureOptions*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:351*

___
<a id="secureprotocol"></a>

### `<Optional>` secureProtocol

**● secureProtocol**: *`undefined` \| `string`*

*Inherited from SecureContextOptions.secureProtocol*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:352*

___
<a id="servername"></a>

### `<Optional>` servername

**● servername**: *`undefined` \| `string`*

*Inherited from ConnectionOptions.servername*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:270*

___
<a id="session"></a>

### `<Optional>` session

**● session**: *`Buffer`*

*Inherited from ConnectionOptions.session*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:271*

___
<a id="sessionidcontext"></a>

### `<Optional>` sessionIdContext

**● sessionIdContext**: *`undefined` \| `string`*

*Inherited from SecureContextOptions.sessionIdContext*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:353*

___
<a id="socket"></a>

### `<Optional>` socket

**● socket**: *`net.Socket`*

*Inherited from ConnectionOptions.socket*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:265*

___
<a id="timeout"></a>

### `<Optional>` timeout

**● timeout**: *`undefined` \| `number`*

*Inherited from ConnectionOptions.timeout*

*Defined in /Users/jblanco/axa/bauta-nodejs/node_modules/@types/node/tls.d.ts:275*

___

