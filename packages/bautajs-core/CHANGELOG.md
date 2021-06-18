# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.6.3](http://github.axa.com/Digital/bauta-nodejs/compare/v3.6.2...v3.6.3) (2021-06-18)


### Bug Fixes

* **@bautajs/core:** response validation ([#235](http://github.axa.com/Digital/bauta-nodejs/issues/235)) ([93ea0a5](http://github.axa.com/Digital/bauta-nodejs/commit/93ea0a5de008c6fd482f6ad8df2950a8dc11e35f))
* **core:** allow open api v2 res validation ([482ac69](http://github.axa.com/Digital/bauta-nodejs/commit/482ac69dc1f6afc52a09d1f1b41a95bef844f87f))





## [3.6.2](http://github.axa.com/Digital/bauta-nodejs/compare/v3.6.1...v3.6.2) (2021-05-12)


### Bug Fixes

* **security:** update dependencies to prevent npm audit ([#222](http://github.axa.com/Digital/bauta-nodejs/issues/222)) ([d5c1aed](http://github.axa.com/Digital/bauta-nodejs/commit/d5c1aed18f343e5ec79ceb3f784339b559e95982))





# [3.6.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.5.0...v3.6.0) (2021-02-11)

**Note:** Version bump only for package @bautajs/core





## [3.4.1](http://github.axa.com/Digital/bauta-nodejs/compare/v3.4.0...v3.4.1) (2020-09-17)


### Bug Fixes

* every operation have to has his own validator ([#199](http://github.axa.com/Digital/bauta-nodejs/issues/199)) ([52b5591](http://github.axa.com/Digital/bauta-nodejs/commit/52b559185d919b4c48cc8435e0156b948a7a14c6))





# [3.4.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.3.0...v3.4.0) (2020-09-16)


### Bug Fixes

* add test for pipeline changing http status ([#197](http://github.axa.com/Digital/bauta-nodejs/issues/197)) ([1c8fcb8](http://github.axa.com/Digital/bauta-nodejs/commit/1c8fcb80bcf4e47d67550b2848a448bb99ce46a5)), closes [#120](http://github.axa.com/Digital/bauta-nodejs/issues/120)


### Features

* **bautajs-core, bautajs-express, bautajs-fastify:** added customFormat ([bdffec1](http://github.axa.com/Digital/bauta-nodejs/commit/bdffec1d3ae728231e88bffe5dfa038264a0f3c4)), closes [#165](http://github.axa.com/Digital/bauta-nodejs/issues/165)





# [3.3.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.2.1...v3.3.0) (2020-07-22)


### Features

* **bautajs-core,bautajs-rest-datasource:** manage truncation on logs ([1483796](http://github.axa.com/Digital/bauta-nodejs/commit/14837964bcc677b75a29955448952c4d9594d1b1)), closes [#186](http://github.axa.com/Digital/bauta-nodejs/issues/186)





# [3.2.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.1.3...v3.2.0) (2020-05-22)


### Bug Fixes

* **@bautajs/core:** set coerceTypes to false by default ([6f198c1](http://github.axa.com/Digital/bauta-nodejs/commit/6f198c1fbecc7ece7406dda22aa5df2110f561c4)), closes [#172](http://github.axa.com/Digital/bauta-nodejs/issues/172)





## [3.1.3](http://github.axa.com/Digital/bauta-nodejs/compare/v3.1.2...v3.1.3) (2020-04-28)


### Bug Fixes

* **@bautajs/core:** validation error should be 422 ([#170](http://github.axa.com/Digital/bauta-nodejs/issues/170)) ([32fc1d2](http://github.axa.com/Digital/bauta-nodejs/commit/32fc1d2))





## [3.1.1](http://github.axa.com/Digital/bauta-nodejs/compare/v3.1.0...v3.1.1) (2020-04-20)


### Bug Fixes

* **@bautajs/core:** hidde ajv logs ([be4b82b](http://github.axa.com/Digital/bauta-nodejs/commit/be4b82b)), closes [#165](http://github.axa.com/Digital/bauta-nodejs/issues/165)





# [3.1.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.0.1...v3.1.0) (2020-04-20)


### Bug Fixes

* pino 6 logs are not concatenated ([#163](http://github.axa.com/Digital/bauta-nodejs/issues/163)) ([d6c7a80](http://github.axa.com/Digital/bauta-nodejs/commit/d6c7a80))


### Features

* set default request header to x-request-id ([#164](http://github.axa.com/Digital/bauta-nodejs/issues/164)) ([8268f9c](http://github.axa.com/Digital/bauta-nodejs/commit/8268f9c))





## [3.0.1](http://github.axa.com/Digital/bauta-nodejs/compare/v3.0.0...v3.0.1) (2020-04-17)

**Note:** Version bump only for package @bautajs/core





## [3.0.0](http://github.axa.com/Digital/bauta-nodejs/compare/v3.0.0...v2.3.0) (2020-04-16)

### New Features

* **@bautajs/core:**  add fastify plugin (c303cd70)

### Bug Fixes

* **@bautajs/core:**
  *  add bautajs to pipeline error handler (#158) (c211c08f)
  *  error can have additional properties  (#139) (a0a89e49)
* **bautajs-core:**  no validate response streams (#122) (fe39e7e3)

### BREAKING CHANGES

* **@bautajs/core:**
  *  Improve logs (#146) (2b8e73ba)
  *  bautajs bootstrapping now is an async process (#136) (2a974ca6)
* **@bautajs/core,:**  logger (#142) (acee5cc6)
*  Change the validator architecture (#125) (319fb856)
*  change validator from open-api module to directly AJV (0be35150)

## [2.5.2](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.1...v2.5.2) (2020-04-16) 

### Bug Fixes

* **@bautajs-core:**  added bautajs to the promise error handler (#151) (da269bcb)

## [2.5.1](http://github.axa.com/Digital/bauta-nodejs/compare/v2.5.0...v2.5.1) (2020-04-16)

### Bug Fixes

* **@bautajs-core:**  add bauta reference in pipeline error handler (#150) (a4688ee7)

## [2.3.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.2.2...v2.3.0) (2020-04-16) 

### New Features

* **@bautajs/core:**  improve morgan logs (#141) (ef3855de)

### Bug Fixes

* **@bautajs-core:**  validate response should be inisde promise resolve (3eb92f0c)

## [2.2.2](http://github.axa.com/Digital/bauta-nodejs/compare/v2.2.1...v2.2.2) (2019-10-29)


### Bug Fixes

* **@bautajs-core:** validate response should be inisde promise resolve ([3eb92f0](http://github.axa.com/Digital/bauta-nodejs/commit/3eb92f0c3ac3ca54a5c0072893181d414eda09c6))





## [2.2.1](http://github.axa.com/Digital/bauta-nodejs/compare/v2.2.0...v2.2.1) (2019-10-29)


### Bug Fixes

* operation run do not always returned a promise ([#119](http://github.axa.com/Digital/bauta-nodejs/issues/119)) ([bc5b755](http://github.axa.com/Digital/bauta-nodejs/commit/bc5b7553b7253075751d6fbdc94e4cf90b45a2d4)), closes [#118](http://github.axa.com/Digital/bauta-nodejs/issues/118) [#117](http://github.axa.com/Digital/bauta-nodejs/issues/117)





# [2.2.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.5...v2.2.0) (2019-09-17)


### Bug Fixes

* **@bautajs-core:** add not found error ([9fdf034](http://github.axa.com/Digital/bauta-nodejs/commit/9fdf034))


### Features

* **@bautajs/core:** do not log default operation step ([0e4cee8](http://github.axa.com/Digital/bauta-nodejs/commit/0e4cee8)), closes [#103](http://github.axa.com/Digital/bauta-nodejs/issues/103)





## [2.1.5](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.4...v2.1.5) (2019-09-04)


### Bug Fixes

* **@bautajs/core:** allow null an the openapi schema on scanprops ([#105](http://github.axa.com/Digital/bauta-nodejs/issues/105)) ([ec984ff](http://github.axa.com/Digital/bauta-nodejs/commit/ec984ff)), closes [#102](http://github.axa.com/Digital/bauta-nodejs/issues/102)
* **@bautajs/core:** do not validate response on set res.headerSent or res.finished ([f1d8f76](http://github.axa.com/Digital/bauta-nodejs/commit/f1d8f76)), closes [#101](http://github.axa.com/Digital/bauta-nodejs/issues/101)





## [2.1.4](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.3...v2.1.4) (2019-08-22)


### Bug Fixes

* **@bautajs/core:** version 2.1.0 introduced a breaking change, allow back compatibility with 2.0.0. ([dfb979b](http://github.axa.com/Digital/bauta-nodejs/commit/dfb979b))





## [2.1.3](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.2...v2.1.3) (2019-08-22)


### Bug Fixes

* **@bautajs/core:** allow charset on content-type on request validation ([d7ab37e](http://github.axa.com/Digital/bauta-nodejs/commit/d7ab37e))





## [2.1.2](http://github.axa.com/Digital/bauta-nodejs/compare/v2.1.1...v2.1.2) (2019-08-21)


### Bug Fixes

* use forked openapi-request-validator until release ([caa4607](http://github.axa.com/Digital/bauta-nodejs/commit/caa4607))





# [2.1.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.1...v2.1.0) (2019-08-21)


### Features

* **@bautajs/core:**  pipelines are now runnable. ([#89](http://github.axa.com/Digital/bauta-nodejs/issues/89)) ([78f21d8](http://github.axa.com/Digital/bauta-nodejs/commit/78f21d8)), closes [#86](http://github.axa.com/Digital/bauta-nodejs/issues/86) [#93](http://github.axa.com/Digital/bauta-nodejs/issues/93)





# [2.0.0](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.10...v2.0.0) (2019-07-24)


### Bug Fixes

* allow foreverAgent and extend the agent ([018080e](http://github.axa.com/Digital/bauta-nodejs/commit/018080e))


### Features

* BautaJS refactor concept ([#83](http://github.axa.com/Digital/bauta-nodejs/issues/83)) ([a138074](http://github.axa.com/Digital/bauta-nodejs/commit/a138074)), closes [#82](http://github.axa.com/Digital/bauta-nodejs/issues/82) [#74](http://github.axa.com/Digital/bauta-nodejs/issues/74) [#72](http://github.axa.com/Digital/bauta-nodejs/issues/72) [#78](http://github.axa.com/Digital/bauta-nodejs/issues/78)


### BREAKING CHANGES

* datasources has been removed from the bautajs core. Use it as separated feature (decorator).
* service concept has been removed from the core. Operations are now built from the OpenAPI schema.
* All packages has been moved under @bautajs scope.
* Not core decorators has been moved to another package. @bautajs/datasource-rest, @bautajs/decorator-cache, @bautajs/decorator-template, @bautajs/decorator-filter
* ctx.dataSource do not exist any more, use providers from @bautajs/datasource-rest
* datasource structure has change, services and operations where removed, now use providers instead.
* Operation methods has been modified, some of them has been removed, see ./types for more info
* setup method destroy old version pipeline
* operation versioning has changed, see ./docs/api-versioning.md
* to add certificates and agent options to a datasource you have to create a new agent.
* error handler has been moved to pipeline level as onError

* Features:
* not posible to update agent options, instead create a new agent for it.

- update dependencies to fix audit





# [2.0.0-alpha.10](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2019-07-10)


### Features

* datasource as plugins ([2e86ae8](http://github.axa.com/Digital/bauta-nodejs/commit/2e86ae8)), closes [#75](http://github.axa.com/Digital/bauta-nodejs/issues/75) [#72](http://github.axa.com/Digital/bauta-nodejs/issues/72)


### BREAKING CHANGES

* @bautajs/core it does not have got anymore
* @bautajs/core datasources have been modified to allow pluggable datasource system
* rename decorators packages @bautajs/decorator-cache, @bautajs/decorator-template, @bautajs/decorator-filter
* remove @bautajs/decorators package
* move native-proxy-agent to amf-commons-nodejs
* move multipart-request-builder to amf-commons-nodejs
* compileDataSource include the compiled dataSource as a fn parameter after ctx instead of replace the ctx.dataSource
* ctx.dataSource has been renamed to ctx.dataSourceBuilder





# [2.0.0-alpha.9](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2019-06-28)


### Bug Fixes

* **bautajs:** default open api setter needs to specify empty parameters array ([0984137](http://github.axa.com/Digital/bauta-nodejs/commit/0984137))





# [2.0.0-alpha.8](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2019-06-11)


### Bug Fixes

* **bautajs:** parameters and responses are now take it in account on get the strict definitions ([9b864df](http://github.axa.com/Digital/bauta-nodejs/commit/9b864df)), closes [#70](http://github.axa.com/Digital/bauta-nodejs/issues/70)
* **bautajs, bautajs-express:** operations where exposed twice ([4b0afc8](http://github.axa.com/Digital/bauta-nodejs/commit/4b0afc8)), closes [#69](http://github.axa.com/Digital/bauta-nodejs/issues/69)


### Features

* **bautajs:** log error response from 3 party API with log level error or more ([2a8bf24](http://github.axa.com/Digital/bauta-nodejs/commit/2a8bf24))


### BREAKING CHANGES

* **bautajs, bautajs-express:** dataSourceCtx parameter has becomed dataSourceStatic and can be accessed by `$static.` word inside the dataSources

- Improve express update route algorithm





# [2.0.0-alpha.7](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2019-06-06)


### Bug Fixes

* **bautajs, bautajs/express:** No more crash on create documentation. Get ride of the not used schema definitions. ([1f2bf7f](http://github.axa.com/Digital/bauta-nodejs/commit/1f2bf7f)), closes [#68](http://github.axa.com/Digital/bauta-nodejs/issues/68) [#67](http://github.axa.com/Digital/bauta-nodejs/issues/67)





# [2.0.0-alpha.6](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2019-06-05)


### Bug Fixes

* dataSource from operation must be a private variable ([1bb3f5d](http://github.axa.com/Digital/bauta-nodejs/commit/1bb3f5d))
* **bautajs:** ctx.data was not transmited between operations on run ([1462734](http://github.axa.com/Digital/bauta-nodejs/commit/1462734))


### Features

* **bautajs:** operation.run() req and res are not mandatory anymore ([d6bb9d4](http://github.axa.com/Digital/bauta-nodejs/commit/d6bb9d4))


### BREAKING CHANGES

* operation.dataSource(ctx).request() can not be performed anymore. DataSource is only accesible inside the operation pipeline.

Use instead operation.run()





# [2.0.0-alpha.5](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2019-06-04)


### Bug Fixes

* **bautajs:** default step was not executed even if setup was not specified ([388e252](http://github.axa.com/Digital/bauta-nodejs/commit/388e252))





# [2.0.0-alpha.4](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2019-06-04)


### Bug Fixes

* **bautajs,bautajs-express:** pipeline decorator has an invalid type of parameter ([46e1b97](http://github.axa.com/Digital/bauta-nodejs/commit/46e1b97))





# [2.0.0-alpha.3](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2019-06-03)

**Note:** Version bump only for package @bautajs/core





# [2.0.0-alpha.2](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2019-06-03)

**Note:** Version bump only for package @bautajs/core





# [2.0.0-alpha.1](http://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2019-06-03)

**Note:** Version bump only for package @bautajs/core





# [2.0.0-alpha.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.2.2...v2.0.0-alpha.0) (2019-06-03)


### Features

* move to typescript [#49](http://github.axa.com/Digital/bauta-nodejs/issues/49) ([#65](http://github.axa.com/Digital/bauta-nodejs/issues/65)) ([2fa2676](http://github.axa.com/Digital/bauta-nodejs/commit/2fa2676)), closes [#59](http://github.axa.com/Digital/bauta-nodejs/issues/59) [#62](http://github.axa.com/Digital/bauta-nodejs/issues/62)


### BREAKING CHANGES

* dataSource compilation parameters had change, now no ctx has to be passed
* dataSource url can not be changed on dataSource.request() function, request() only allow Got options.
* .push method now only accepts a function with the given signature (value, ctx) => any
* loopbackFilter dataSource option has been moved to a standalone package @bautajs/filters-decorator
* service.myService.version.operation.push has been moved to operation.setup(pipeline => pipeline.push()) to allow better code intellisense
* Step class has been removed
* service.myService.version.push has been removed
* service.myService.version.operation.exec has been replaced for operation.run
* context.req and context.res are now mandatory parameters on run the operation pipeline
* dataSource.request() now returns an object with asBody(), asStream(), asResponse()
* dataSource resolveBodyOnly has been deleted from dataSource now use only on the request, dataSource.request({ resolveBodyOnly:false })
* dataSource stream options has been removed, now use use only on the request, dataSource.request({ stream:true })
* decorators has been moved from 'bautajs/decorators/..' to an standalone package '@bautajs/decorators'
* context.req and context.res are now mandatory parameters on run the operation pipeline





## [1.2.2](http://github.axa.com/Digital/bauta-nodejs/compare/v1.2.1...v1.2.2) (2019-05-08)


### Features

* **batuajs,bautajs-express:** add  strict definition filter for explorer ([#64](http://github.axa.com/Digital/bauta-nodejs/issues/64)) ([02d9a4b](http://github.axa.com/Digital/bauta-nodejs/commit/02d9a4b)), closes [#63](http://github.axa.com/Digital/bauta-nodejs/issues/63)





## [1.2.1](http://github.axa.com/Digital/bauta-nodejs/compare/v1.2.0...v1.2.1) (2019-04-11)


### Bug Fixes

* **bautajs:** rollback to stjs ([e73edbd](http://github.axa.com/Digital/bauta-nodejs/commit/e73edbd)), closes [#57](http://github.axa.com/Digital/bauta-nodejs/issues/57)





# [1.2.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.5...v1.2.0) (2019-04-11)


### Features

* **bautajs:** add response on validation response error ([#50](http://github.axa.com/Digital/bauta-nodejs/issues/50)) ([163eb9c](http://github.axa.com/Digital/bauta-nodejs/commit/163eb9c)), closes [#48](http://github.axa.com/Digital/bauta-nodejs/issues/48)
* **bautajs:** Inject to resolvers ([#54](http://github.axa.com/Digital/bauta-nodejs/issues/54)) ([c4a730e](http://github.axa.com/Digital/bauta-nodejs/commit/c4a730e)), closes [#46](http://github.axa.com/Digital/bauta-nodejs/issues/46)
* **bautajs:** replace mergeDeep with deepMerge ([#51](http://github.axa.com/Digital/bauta-nodejs/issues/51)) ([5d2db11](http://github.axa.com/Digital/bauta-nodejs/commit/5d2db11)), closes [#47](http://github.axa.com/Digital/bauta-nodejs/issues/47)
* **bautajs:** start using json4json instead of stjs ([#52](http://github.axa.com/Digital/bauta-nodejs/issues/52)) ([e525464](http://github.axa.com/Digital/bauta-nodejs/commit/e525464)), closes [#32](http://github.axa.com/Digital/bauta-nodejs/issues/32)
* **bautajs-cache-decorator:** add a cache decorator ([#56](http://github.axa.com/Digital/bauta-nodejs/issues/56)) ([692a46b](http://github.axa.com/Digital/bauta-nodejs/commit/692a46b)), closes [#54](http://github.axa.com/Digital/bauta-nodejs/issues/54) [#55](http://github.axa.com/Digital/bauta-nodejs/issues/55)





## [1.1.5](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.4...v1.1.5) (2019-04-01)


### Bug Fixes

* **bautajs:** issue with resolveBodyOnly ([#45](http://github.axa.com/Digital/bauta-nodejs/issues/45)) ([d61325b](http://github.axa.com/Digital/bauta-nodejs/commit/d61325b)), closes [#44](http://github.axa.com/Digital/bauta-nodejs/issues/44) [#43](http://github.axa.com/Digital/bauta-nodejs/issues/43)





## [1.1.4](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.3...v1.1.4) (2019-03-26)


### Bug Fixes

* **bautajs:** Add local scope package for request validator ([7281fd7](http://github.axa.com/Digital/bauta-nodejs/commit/7281fd7)), closes [#41](http://github.axa.com/Digital/bauta-nodejs/issues/41)





## [1.1.3](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.2...v1.1.3) (2019-03-25)


### Bug Fixes

* **bautajs:** Return the correct status code on validate the request body. ([8f08847](http://github.axa.com/Digital/bauta-nodejs/commit/8f08847))





## [1.1.2](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.1...v1.1.2) (2019-03-22)


### Bug Fixes

* **bautajs:** verrors.errors is check before calculate the length ([5f06d7c](http://github.axa.com/Digital/bauta-nodejs/commit/5f06d7c)), closes [#40](http://github.axa.com/Digital/bauta-nodejs/issues/40)





## [1.1.1](http://github.axa.com/Digital/bauta-nodejs/compare/v1.1.0...v1.1.1) (2019-03-22)


### Bug Fixes

* **bautajs:** validate response was not working ([#38](http://github.axa.com/Digital/bauta-nodejs/issues/38)) ([0cddb8a](http://github.axa.com/Digital/bauta-nodejs/commit/0cddb8a)), closes [#36](http://github.axa.com/Digital/bauta-nodejs/issues/36)





# [1.1.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.4...v1.1.0) (2019-03-19)


### Bug Fixes

* **bautajs:** validate response and validate request are now active by default ([#34](http://github.axa.com/Digital/bauta-nodejs/issues/34)) ([212dc3e](http://github.axa.com/Digital/bauta-nodejs/commit/212dc3e)), closes [#33](http://github.axa.com/Digital/bauta-nodejs/issues/33)





## [1.0.4](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.3...v1.0.4) (2019-03-12)


### Bug Fixes

* **bautajs:** fix [#30](http://github.axa.com/Digital/bauta-nodejs/issues/30) ([f57fa40](http://github.axa.com/Digital/bauta-nodejs/commit/f57fa40))





## [1.0.2](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.1...v1.0.2) (2019-03-07)


### Bug Fixes

* **bautajs:** send previous value on decorators datasources ([5b2d51c](http://github.axa.com/Digital/bauta-nodejs/commit/5b2d51c)), closes [#26](http://github.axa.com/Digital/bauta-nodejs/issues/26)
* **bautajs:** workarround for openAPI request validator bug ([4deec6d](http://github.axa.com/Digital/bauta-nodejs/commit/4deec6d)), closes [#27](http://github.axa.com/Digital/bauta-nodejs/issues/27)





## [1.0.1](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.0...v1.0.1) (2019-03-06)


### Bug Fixes

* **bautajs:** throw an error if operation id is not ([199b17d](http://github.axa.com/Digital/bauta-nodejs/commit/199b17d)), closes [#22](http://github.axa.com/Digital/bauta-nodejs/issues/22)





# [1.0.0](http://github.axa.com/Digital/bauta-nodejs/compare/v1.0.0-alpha.0...v1.0.0) (2019-03-06)


### Bug Fixes

* **bautajs:** Add got cache logging support ([3d1b018](http://github.axa.com/Digital/bauta-nodejs/commit/3d1b018))
* **bautajs:** Add got cache logging support ([707c70b](http://github.axa.com/Digital/bauta-nodejs/commit/707c70b))
* **bautajs:** execute errorHandler just once in all the chain ([464e9e4](http://github.axa.com/Digital/bauta-nodejs/commit/464e9e4)), closes [#17](http://github.axa.com/Digital/bauta-nodejs/issues/17)
* **bautajs:** fix the req end stoper on the chain ([c1c82e9](http://github.axa.com/Digital/bauta-nodejs/commit/c1c82e9))
* **bautajs:** sintactic error on response log ([664bb43](http://github.axa.com/Digital/bauta-nodejs/commit/664bb43))


### Features

* **bautajs:** allow to define options on service level ([fd8268a](http://github.axa.com/Digital/bauta-nodejs/commit/fd8268a)), closes [#10](http://github.axa.com/Digital/bauta-nodejs/issues/10)
* **bautajs-express:** expose swagger explorer ([289ec11](http://github.axa.com/Digital/bauta-nodejs/commit/289ec11)), closes [#14](http://github.axa.com/Digital/bauta-nodejs/issues/14)
* **bautajs,bautajs-express:** allow to set private operations. ([441fe2d](http://github.axa.com/Digital/bauta-nodejs/commit/441fe2d))





# 1.0.0-alpha.0 (2019-02-26)


### Bug Fixes

* **bautajs:** request validation typing ([39002fd](http://github.axa.com/Digital/bauta-nodejs/commit/39002fd))


### Features

* add parallel decorator ([14709ac](http://github.axa.com/Digital/bauta-nodejs/commit/14709ac))
* more of before ([5e9bb66](http://github.axa.com/Digital/bauta-nodejs/commit/5e9bb66))
* **batuajs:** renamee batch to flow ([84f03d5](http://github.axa.com/Digital/bauta-nodejs/commit/84f03d5))
* **bautajs:** add more decorators and documentation ([9f51a08](http://github.axa.com/Digital/bauta-nodejs/commit/9f51a08))
* **bautajs:** fixed test, move to a class aproach, removed next, previous and loaders concept. ([ffcfe6e](http://github.axa.com/Digital/bauta-nodejs/commit/ffcfe6e))
