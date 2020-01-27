# How to Contribute

## Reporting Issues

Should you run into issues with the project, please don't hesitate to let us know by
[filing an issue](https://github.axa.com/Digital/bauta-nodejs/issues/new).

Pull requests containing only failing tests demonstrating the issue are welcomed
and this also helps ensure that your issue won't regress in the future once it's fixed.

## Pull Requests

We accept [pull requests](https://github.axa.com/Digital/bauta-nodejs/pull/new/master)!

Generally we like to see pull requests that

- Maintain the existing code style
- Are focused on a single change (i.e. avoid large refactoring or style adjustments in untouched code if not the primary goal of the pull request)
- Have [good commit messages](https://www.conventionalcommits.org/)
- Reference issues and pull requests explicitly
- Have tests
- Don't decrease the current code coverage

## Running tests

- To run all tests, use `npm run test`.
- To run units tests, use `npm run units`.
- To run specific package units tests, use `npm run units -- --projects=./packages/bautajs`.
- To run specific package tests, use `npm run test -- --projects=./packages/bautajs`.
- To run the linter use, use `npm run lint`.
- To clean the packages node_modules, use `npm run clean`.
- To bootstrap the packages node_modules, use `npm run bootstrap`.