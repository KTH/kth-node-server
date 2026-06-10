# Changelog

All notable changes for major version updates will be documented here.

## 5.0.0

### Breaking changes

- Requires Node.js `>=24`.
- Upgraded runtime dependency `express` from v4 to v5.

### Notable changes

- Updated tooling stack to modern versions (ESLint 9, Jest 30, Husky 9).
- Migrated linting configuration to flat config (`eslint.config.js`) and removed legacy `.eslintrc`.
- Removed `node-fetch` from development dependencies and aligned tests with native Node capabilities.
- Updated project docs and license metadata.

## 4.0.0

The package has been renamed to @kth/server.

Internal tests, i.e. unit tests have been updated to use jest instead of mocha.
