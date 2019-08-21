# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.2](https://github.axa.com/Digital/bauta-nodejs/compare/v2.1.1...v2.1.2) (2019-08-21)

**Note:** Version bump only for package @bautajs/decorator-cache





# [2.1.0](https://github.axa.com/Digital/bauta-nodejs/compare/v2.0.1...v2.1.0) (2019-08-21)


### Features

* **@bautajs/core:**  pipelines are now runnable. ([#89](https://github.axa.com/Digital/bauta-nodejs/issues/89)) ([78f21d8](https://github.axa.com/Digital/bauta-nodejs/commit/78f21d8)), closes [#86](https://github.axa.com/Digital/bauta-nodejs/issues/86) [#93](https://github.axa.com/Digital/bauta-nodejs/issues/93)





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
