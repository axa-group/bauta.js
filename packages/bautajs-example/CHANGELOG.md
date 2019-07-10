# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
