# How to Contribute

## Reporting Issues

Should you run into issues with the project, please don't hesitate to let us know by
[filing an issue](https://github.com/axa-group/bauta.js/issues/new).

Pull requests containing only failing tests demonstrating the issue are welcomed
and this also helps ensure that your issue won't regress in the future once it's fixed.

## Pull Requests

We accept [pull requests](https://github.com/axa-group/bauta.js/pull/new/master)!

Generally we like to see pull requests that

- Maintain the existing code style
- Are focused on a single change (i.e. avoid large refactoring or style adjustments in untouched code if not the primary goal of the pull request)
- Have [good commit messages](https://www.conventionalcommits.org/)
- Reference issues and pull requests explicitly
- Have tests
- Don't decrease the current code coverage

## Local setup

- Use Node.js 24 or newer.
- Install dependencies from the repository root with `npm install`.
- This repository uses npm workspaces, so package dependencies are installed and linked from the root project.

Typical local validation flow from the root project:

- `npm run lint`
- `npm run build`
- `npm test`

## Running tests

- To run all tests, use `npm run test`.
- To run tests for a specific package, run `cd packages/<package> && npm test`.
- To run the linter, use `npm run lint`.
- To build all packages, use `npm run build`.
- To clean the packages node_modules, use `npm run clean`.

## Usage with VSCode remote containers

- Install docker
- Install VSCode
- Open the bautajs cloned folder in VSCode as a remote container
