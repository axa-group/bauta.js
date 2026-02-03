# Migration Guide

This document describes how to migrate between major versions of bauta.js.

## Migrating from v3.x to v4.x

### Breaking Changes

#### 1. Node.js 20+ Required

bauta.js v4.x requires **Node.js 20 or higher**. Node.js 18 is no longer supported.

**Action required:** Update your Node.js version to 20 or later before upgrading.

```bash
# Check your current Node.js version
node --version

# If using nvm, install Node.js 20
nvm install 20
nvm use 20
```

#### 2. Fastify 5.x Required (for @axa/bautajs-fastify users)

bauta.js v4.x requires **Fastify 5.x**. If you're using `@axa/bautajs-fastify`, you must upgrade Fastify in your application.

**Action required:** Update your `package.json`:

```json
{
  "dependencies": {
    "fastify": "^5.0.0"
  }
}
```

##### Fastify 5 Breaking Changes That May Affect Your Application

If you're using Fastify directly in your application, be aware of these changes:

1. **`reply.sent` is now read-only** - You can no longer assign `reply.sent = true`. Use `reply.hijack()` instead if you need to take over the response.

2. **Validation error handling changed** - The `attachValidation` option no longer exists. Validation errors are now thrown directly and can be caught with custom error handlers.

3. **Request `aborted` event removed** - Use `request.raw.on('close')` with `request.raw.destroyed` check instead of the `aborted` event.

4. **`useSemicolonDelimiter` default changed** - Query string parsing now defaults to `false` for semicolon delimiter.

For a complete list of Fastify 5 breaking changes, see the [Fastify v5 Migration Guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/).

#### 3. fastify-plugin 5.x Required

If you're creating custom Fastify plugins that integrate with bauta.js, update `fastify-plugin`:

```json
{
  "dependencies": {
    "fastify-plugin": "^5.0.0"
  }
}
```

#### 4. Swagger UI Dependencies Changed (for @axa/bautajs-fastify users with explorer enabled)

The Swagger/OpenAPI explorer now uses separate packages:

- **@fastify/swagger** upgraded from v7.x to **v9.x**
- **@fastify/swagger-ui** upgraded to **v5.x** (now a separate package)

If you're importing these packages directly in your application (outside of bauta.js), update them:

```json
{
  "dependencies": {
    "@fastify/swagger": "^9.0.0",
    "@fastify/swagger-ui": "^5.0.0"
  }
}
```

**Note:** If you're only using bauta.js's built-in explorer feature, no action is required - the dependencies are handled internally.

### Migration Steps

1. **Update Node.js** to version 20 or later

2. **Update bauta.js packages** in your `package.json`:

   ```json
   {
     "dependencies": {
       "@axa/bautajs-core": "^4.0.0",
       "@axa/bautajs-fastify": "^4.0.0",
       "@axa/bautajs-datasource-rest": "^4.0.0"
     }
   }
   ```

3. **Update Fastify** (if using `@axa/bautajs-fastify`):

   ```json
   {
     "dependencies": {
       "fastify": "^5.0.0",
       "fastify-plugin": "^5.0.0"
     }
   }
   ```

4. **Run npm install**:

   ```bash
   npm install
   ```

5. **Test your application** thoroughly, especially:
   - API endpoints
   - Validation error responses
   - Custom Fastify plugins
   - Swagger UI (if using explorer)

### No Changes Required For

- **@axa/bautajs-express users** - Express integration is unchanged (though you still need Node.js 20+)
- **Core bauta.js pipeline and decorators** - The pipeline API (`pipe`, `step`, decorators) remains unchanged
- **Data source REST** - The REST data source API remains unchanged
- **OpenAPI/Swagger definitions** - Your API definitions work as before

### Troubleshooting

#### Swagger UI returns 404 for static assets

If you're using a custom prefix for your API routes and Swagger UI assets fail to load, ensure you're registering the bauta.js plugin with the correct prefix option:

```javascript
fastify.register(bautajs, {
  prefix: '/api',
  apiDefinition,
  resolversPath: './resolvers.js',
  explorer: { enabled: true }
});
```

#### Validation errors have different format

Fastify 5 changed how validation errors are formatted. If you have tests or error handling that depends on the exact error format, you may need to update them. The new format uses `schemaErrorFormatter` for consistent error messages.

#### TypeScript type errors

If you encounter TypeScript errors after upgrading, ensure all your `@types/*` packages are up to date and compatible with Fastify 5:

```bash
npm update @types/node
```

### Getting Help

If you encounter issues during migration:

1. Check the [GitHub Issues](https://github.com/axa-group/bauta.js/issues) for similar problems
2. Review the [Fastify v5 Migration Guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/) for Fastify-specific issues
3. Open a new issue with details about your environment and the error you're seeing
