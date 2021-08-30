# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.1.2](https://github.axa.com/Digital/bauta-nodejs/compare/v5.1.1...v5.1.2) (2021-08-30)


### Bug Fixes

* **fastify:** response already sent ([#263](https://github.axa.com/Digital/bauta-nodejs/issues/263)) ([c20513e](https://github.axa.com/Digital/bauta-nodejs/commit/c20513ecb77024a2dc8afa6febbf3052ea762351))





## [5.1.1](https://github.axa.com/Digital/bauta-nodejs/compare/v5.1.0...v5.1.1) (2021-08-11)

**Note:** Version bump only for package @bautajs/fastify





# [5.1.0](https://github.axa.com/Digital/bauta-nodejs/compare/v5.0.1...v5.1.0) (2021-08-09)


### Bug Fixes

* **fastify,express:** do not log the req URL ([df43706](https://github.axa.com/Digital/bauta-nodejs/commit/df43706e69e5db942ff413028c6ba38b94ec0fe3))





## [5.0.1](https://github.axa.com/Digital/bauta-nodejs/compare/v5.0.0...v5.0.1) (2021-07-23)


### Bug Fixes

* **fastify:** request validation ([#254](https://github.axa.com/Digital/bauta-nodejs/issues/254)) ([882696b](https://github.axa.com/Digital/bauta-nodejs/commit/882696b279f1c0626aaea4d572b60a2bf6dd3c6e))





# [5.0.0](https://github.axa.com/Digital/bauta-nodejs/compare/v4.1.0...v5.0.0) (2021-07-23)


### Features

* **fastify,express,core:** Improve response/request validation ([#253](https://github.axa.com/Digital/bauta-nodejs/issues/253)) ([d6d1c4e](https://github.axa.com/Digital/bauta-nodejs/commit/d6d1c4ee2b76d0cf30b7c82161f095e68e1dc829))


### BREAKING CHANGES

* **fastify,express,core:** response/request validation is not performed out of the box on @bautajs/core
* **fastify,express,core:** response validation is done on the final request stage on @bautajs/fastify and @bautajs/express instead of after run an operation
* **fastify,express,core:** response validation is performed over error handler thrown errors
* **fastify,express,core:** getRequest, getResponse has been removed from @bautajs/core constructor





# [4.1.0](https://github.axa.com/Digital/bauta-nodejs/compare/v4.0.3...v4.1.0) (2021-07-09)


### Bug Fixes

* **core:** allow open api v2 res validation ([8e152b0](https://github.axa.com/Digital/bauta-nodejs/commit/8e152b067fab041aeb37b40d52fb3ec51c2e6ad7))


### Features

* **fastify:** hooks on api endpoints ([#245](https://github.axa.com/Digital/bauta-nodejs/issues/245)) ([b8084ab](https://github.axa.com/Digital/bauta-nodejs/commit/b8084abc97faf528263a1cc5f9bd2ffeccfff8a2))





## [4.0.3](https://github.axa.com/Digital/bauta-nodejs/compare/v4.0.2...v4.0.3) (2021-06-11)

**Note:** Version bump only for package @bautajs/fastify





## [4.0.2](https://github.axa.com/Digital/bauta-nodejs/compare/v4.0.1...v4.0.2) (2021-06-02)


### Bug Fixes

* **@bautajs/core:** validation status code ([#232](https://github.axa.com/Digital/bauta-nodejs/issues/232)) ([500a965](https://github.axa.com/Digital/bauta-nodejs/commit/500a96583958167feca11fc8ed014de2a5e30323))





## [4.0.1](https://github.axa.com/Digital/bauta-nodejs/compare/v4.0.0...v4.0.1) (2021-05-26)


### Bug Fixes

* run must be async ([#231](https://github.axa.com/Digital/bauta-nodejs/issues/231)) ([63338c1](https://github.axa.com/Digital/bauta-nodejs/commit/63338c12873f63fa02ed67e489be3b21a0d358a9))





# [4.0.0](https://github.axa.com/Digital/bauta-nodejs/compare/v3.4.1...v4.0.0) (2021-05-21)


### Bug Fixes

* remove unused tags ([#225](https://github.axa.com/Digital/bauta-nodejs/issues/225)) ([c6f6d3d](https://github.axa.com/Digital/bauta-nodejs/commit/c6f6d3dbfdf5bf8b62f79c34d83a378b29e79efb)), closes [#200](https://github.axa.com/Digital/bauta-nodejs/issues/200) [#214](https://github.axa.com/Digital/bauta-nodejs/issues/214)
* **@bautajs/express,@bautajs/fastify:** types ([cff7bd9](https://github.axa.com/Digital/bauta-nodejs/commit/cff7bd95b4e9b227c1b228f8ca7ad11c4ccfe6d7))


### Features

* update packages ([#226](http://github.axa.com/Digital/bauta-nodejs/issues/226)) ([f024891](http://github.axa.com/Digital/bauta-nodejs/commit/f024891c8cf7c56a7a6c0d0e453fcaf6877ea5c9))
* **@bautajs/fastify:** update fastify to v3 ([#213](http://github.axa.com/Digital/bauta-nodejs/issues/213)) ([32764f3](http://github.axa.com/Digital/bauta-nodejs/commit/32764f3ed4036fe77cbeb4e977b892258778827c)), closes [#196](http://github.axa.com/Digital/bauta-nodejs/issues/196)
* add remote containers ([#202](http://github.axa.com/Digital/bauta-nodejs/issues/202)) ([a37c1ab](http://github.axa.com/Digital/bauta-nodejs/commit/a37c1abed2fe5c496525d54a40069c987e585dfc)), closes [#42](http://github.axa.com/Digital/bauta-nodejs/issues/42)


### BREAKING CHANGES

* **@bautajs/fastify:** update fastify to v3 






## [3.4.1](https://github.axa.com/Digital/bauta-nodejs/compare/v3.4.0...v3.4.1) (2020-09-17)

**Note:** Version bump only for package @bautajs/fastify





# [3.4.0](https://github.axa.com/Digital/bauta-nodejs/compare/v3.3.0...v3.4.0) (2020-09-16)


### Bug Fixes

* do not expose in explorer non setup endpoints ([#198](https://github.axa.com/Digital/bauta-nodejs/issues/198)) ([56ffc64](https://github.axa.com/Digital/bauta-nodejs/commit/56ffc64758c6b12654dc64e1aeff72f0b986066f))


### Features

* **bautajs-core, bautajs-express, bautajs-fastify:** added customFormat ([bdffec1](https://github.axa.com/Digital/bauta-nodejs/commit/bdffec1d3ae728231e88bffe5dfa038264a0f3c4)), closes [#165](https://github.axa.com/Digital/bauta-nodejs/issues/165)





# [3.3.0](https://github.axa.com/Digital/bauta-nodejs/compare/v3.2.1...v3.3.0) (2020-07-22)

**Note:** Version bump only for package @bautajs/fastify





# [3.2.0](https://github.axa.com/Digital/bauta-nodejs/compare/v3.1.3...v3.2.0) (2020-05-22)

**Note:** Version bump only for package @bautajs/fastify





## [3.1.3](https://github.axa.com/Digital/bauta-nodejs/compare/v3.1.2...v3.1.3) (2020-04-28)


### Bug Fixes

* **@bautajs/express,@bautajs/fastify:** fix path ([#169](https://github.axa.com/Digital/bauta-nodejs/issues/169)) ([c794ad3](https://github.axa.com/Digital/bauta-nodejs/commit/c794ad3))





## [3.1.1](https://github.axa.com/Digital/bauta-nodejs/compare/v3.1.0...v3.1.1) (2020-04-20)

**Note:** Version bump only for package @bautajs/fastify





# [3.1.0](https://github.axa.com/Digital/bauta-nodejs/compare/v3.0.1...v3.1.0) (2020-04-20)


### Bug Fixes

* pino 6 logs are not concatenated ([#163](https://github.axa.com/Digital/bauta-nodejs/issues/163)) ([d6c7a80](https://github.axa.com/Digital/bauta-nodejs/commit/d6c7a80))


### Features

* set default request header to x-request-id ([#164](https://github.axa.com/Digital/bauta-nodejs/issues/164)) ([8268f9c](https://github.axa.com/Digital/bauta-nodejs/commit/8268f9c))





## [3.0.1](https://github.axa.com/Digital/bauta-nodejs/compare/v3.0.0...v3.0.1) (2020-04-17)

**Note:** Version bump only for package @bautajs/fastify





## [3.0.0](https://github.axa.com/Digital/bauta-nodejs/compare/v3.0.0...v2.5.5) (2020-04-16)

* **@bautajs/core,@bautajs/fastify:**  add fastify plugin (c303cd70)
