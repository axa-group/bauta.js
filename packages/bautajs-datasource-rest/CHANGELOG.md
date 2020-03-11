# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.5.3](https://github.axa.com/Digital/bauta-nodejs/compare/v2.5.2...v2.5.3) (2020-03-11)


### Bug Fixes

* **@bautajs/express:** request cancelation and error log ([#155](https://github.axa.com/Digital/bauta-nodejs/issues/155)) ([7d03d5a](https://github.axa.com/Digital/bauta-nodejs/commit/7d03d5a3cc711e67d15652a90ab70ec72cc7d4a2)), closes [#154](https://github.axa.com/Digital/bauta-nodejs/issues/154)





## [2.2.2](https://github.axa.com/Digital/bauta-nodejs/compare/v2.2.1...v2.2.2) (2019-10-29)

**Note:** Version bump only for package @bautajs/datasource-rest





## [2.2.1](https://github.axa.com/Digital/bauta-nodejs/compare/v2.2.0...v2.2.1) (2019-10-29)


### Bug Fixes

* operation run do not always returned a promise ([#119](https://github.axa.com/Digital/bauta-nodejs/issues/119)) ([bc5b755](https://github.axa.com/Digital/bauta-nodejs/commit/bc5b7553b7253075751d6fbdc94e4cf90b45a2d4)), closes [#118](https://github.axa.com/Digital/bauta-nodejs/issues/118) [#117](https://github.axa.com/Digital/bauta-nodejs/issues/117)





# [2.2.0](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.5...v2.2.0) (2019-09-17)


### Bug Fixes

* **@bautajs/datasource-rest:** add more options for template ([98afc32](https://github.axa.com/Digital/bauta-nodejs/commit/98afc32))
* **@bautajs/datasource-rest:** fix datasource options typescript definition ([5db7eb3](https://github.axa.com/Digital/bauta-nodejs/commit/5db7eb3)), closes [#100](https://github.axa.com/Digital/bauta-nodejs/issues/100)





## [2.1.5](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.4...v2.1.5) (2019-09-04)

**Note:** Version bump only for package @bautajs/datasource-rest





## [2.1.4](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.3...v2.1.4) (2019-08-22)

**Note:** Version bump only for package @bautajs/datasource-rest





## [2.1.3](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.2...v2.1.3) (2019-08-22)

**Note:** Version bump only for package @bautajs/datasource-rest





## [2.1.2](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.1...v2.1.2) (2019-08-21)

**Note:** Version bump only for package @bautajs/datasource-rest





## [2.1.1](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.0...v2.1.1) (2019-08-21)


### Bug Fixes

* **@bautajs/datasource-rest:** retProvider options type must be madatory and can not be a generic type ([ec28089](https://github.axa.com/Digital/bauta-nodejs/commit/ec28089))





# [2.1.0](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.1...v2.1.0) (2019-08-21)


### Bug Fixes

* **@bautajs/datasource-rest:** add deepmerge module ([#91](https://github.axa.com/Digital/bauta-nodejs/issues/91)) ([5c4dd22](https://github.axa.com/Digital/bauta-nodejs/commit/5c4dd22))


### Features

* **@bautajs/core:**  pipelines are now runnable. ([#89](https://github.axa.com/Digital/bauta-nodejs/issues/89)) ([78f21d8](https://github.axa.com/Digital/bauta-nodejs/commit/78f21d8)), closes [#86](https://github.axa.com/Digital/bauta-nodejs/issues/86) [#93](https://github.axa.com/Digital/bauta-nodejs/issues/93)
* **@bautajs/datasource-rest:** id is not longer mandatory when use restProvider ([d7d59a6](https://github.axa.com/Digital/bauta-nodejs/commit/d7d59a6)), closes [#94](https://github.axa.com/Digital/bauta-nodejs/issues/94)





## [2.0.1](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0...v2.0.1) (2019-07-24)


### Bug Fixes

* **@bautajs/datasource-rest:** restProviderTemplate.compile wasn't working. Step fn has 4 parameters not 3 ([45f72e2](https://github.axa.com/Digital/bauta-nodejs/commit/45f72e2))





# [2.0.0](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.10...v2.0.0) (2019-07-24)


### Bug Fixes

* allow foreverAgent and extend the agent ([018080e](https://github.axa.com/Digital/bauta-nodejs/commit/018080e))


### Features

* BautaJS refactor concept ([#83](https://github.axa.com/Digital/bauta-nodejs/issues/83)) ([a138074](https://github.axa.com/Digital/bauta-nodejs/commit/a138074)), closes [#82](https://github.axa.com/Digital/bauta-nodejs/issues/82) [#74](https://github.axa.com/Digital/bauta-nodejs/issues/74) [#72](https://github.axa.com/Digital/bauta-nodejs/issues/72) [#78](https://github.axa.com/Digital/bauta-nodejs/issues/78)


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





# [2.0.0-alpha.10](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2019-07-10)


### Features

* datasource as plugins ([2e86ae8](https://github.axa.com/Digital/bauta-nodejs/commit/2e86ae8)), closes [#75](https://github.axa.com/Digital/bauta-nodejs/issues/75) [#72](https://github.axa.com/Digital/bauta-nodejs/issues/72)


### BREAKING CHANGES

* @bautajs/core it does not have got anymore
* @bautajs/core datasources have been modified to allow pluggable datasource system
* rename decorators packages @bautajs/decorator-cache, @bautajs/decorator-template, @bautajs/decorator-filter
* remove @bautajs/decorators package
* move native-proxy-agent to amf-commons-nodejs
* move multipart-request-builder to amf-commons-nodejs
* compileDataSource include the compiled dataSource as a fn parameter after ctx instead of replace the ctx.dataSource
* ctx.dataSource has been renamed to ctx.dataSourceBuilder





# [2.0.0-alpha.9](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2019-06-28)

**Note:** Version bump only for package @bautajs/cache-decorator





# [2.0.0-alpha.8](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2019-06-11)


### Bug Fixes

* **bautajs, bautajs-express:** operations where exposed twice ([4b0afc8](https://github.axa.com/Digital/bauta-nodejs/commit/4b0afc8)), closes [#69](https://github.axa.com/Digital/bauta-nodejs/issues/69)


### BREAKING CHANGES

* **bautajs, bautajs-express:** dataSourceCtx parameter has becomed dataSourceStatic and can be accessed by `$static.` word inside the dataSources

- Improve express update route algorithm





# [2.0.0-alpha.7](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2019-06-06)


### Bug Fixes

* **bautajs, bautajs/express:** No more crash on create documentation. Get ride of the not used schema definitions. ([1f2bf7f](https://github.axa.com/Digital/bauta-nodejs/commit/1f2bf7f)), closes [#68](https://github.axa.com/Digital/bauta-nodejs/issues/68) [#67](https://github.axa.com/Digital/bauta-nodejs/issues/67)





# [2.0.0-alpha.6](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2019-06-05)

**Note:** Version bump only for package @bautajs/cache-decorator





# [2.0.0-alpha.5](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2019-06-04)

**Note:** Version bump only for package @bautajs/cache-decorator





# [2.0.0-alpha.4](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2019-06-04)

**Note:** Version bump only for package @bautajs/cache-decorator





# [2.0.0-alpha.3](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2019-06-03)

**Note:** Version bump only for package @bautajs/cache-decorator





# [2.0.0-alpha.2](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2019-06-03)

**Note:** Version bump only for package @bautajs/cache-decorator





# [2.0.0-alpha.1](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.0-alpha.0...v2.0.0-alpha.1) (2019-06-03)

**Note:** Version bump only for package @bautajs/cache-decorator





# [2.0.0-alpha.0](https://github.axa.com/Digital/bauta-nodejs/compare/v1.2.2...v2.0.0-alpha.0) (2019-06-03)


### Features

* move to typescript [#49](https://github.axa.com/Digital/bauta-nodejs/issues/49) ([#65](https://github.axa.com/Digital/bauta-nodejs/issues/65)) ([2fa2676](https://github.axa.com/Digital/bauta-nodejs/commit/2fa2676)), closes [#59](https://github.axa.com/Digital/bauta-nodejs/issues/59) [#62](https://github.axa.com/Digital/bauta-nodejs/issues/62)


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





## [1.2.2](https://github.axa.com/Digital/bauta-nodejs/compare/v1.2.1...v1.2.2) (2019-05-08)


### Features

* **batuajs,bautajs-express:** add  strict definition filter for explorer ([#64](https://github.axa.com/Digital/bauta-nodejs/issues/64)) ([02d9a4b](https://github.axa.com/Digital/bauta-nodejs/commit/02d9a4b)), closes [#63](https://github.axa.com/Digital/bauta-nodejs/issues/63)





## [1.2.1](https://github.axa.com/Digital/bauta-nodejs/compare/v1.2.0...v1.2.1) (2019-04-11)

**Note:** Version bump only for package bautajs-cache-decorator





# [1.2.0](https://github.axa.com/Digital/bauta-nodejs/compare/v1.1.5...v1.2.0) (2019-04-11)


### Features

* **bautajs-cache-decorator:** add a cache decorator ([#56](https://github.axa.com/Digital/bauta-nodejs/issues/56)) ([692a46b](https://github.axa.com/Digital/bauta-nodejs/commit/692a46b)), closes [#54](https://github.axa.com/Digital/bauta-nodejs/issues/54) [#55](https://github.axa.com/Digital/bauta-nodejs/issues/55)
