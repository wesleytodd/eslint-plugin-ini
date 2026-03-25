# ESLint plugin for ini files

Lint `ini` format files (ex. `.npmrc`) along with your JavaScript.

## Usage

```bash
npm install -D eslint eslint-plugin-ini
```

```javascript
// eslint.config.js
import { defineConfig } from 'eslint/config';
import ini from 'eslint-plugin-ini';

export default defineConfig([
  ini.configs.recommended,
  ini.configs.npmrc
]);
```

### Configuration

Two default configs are provided:

1. [`recommended`](https://github.com/wesleytodd/eslint-plugin-ini/blob/main/index.mjs#L33-L45): For general ini files
2. [`npmrc`](https://github.com/wesleytodd/eslint-plugin-ini/blob/main/index.mjs#L47-L59): For `.npmrc` files


#### Usage with other plugins/configs

Because this plugin requires a custom `Language`, it might need other plugins/configs to
specify `files` instead of relying on the defaults. For example, `neostandard` has a few plugins
that use the `eslint` defaults that will break when including this plugin. To fix this, be sure
to explicitly include the defaults:

```javascript
import { defineConfig } from 'eslint/config';
import neostandard from 'neostandard';
import ini from 'eslint-plugin-ini';

const ns = neostandard({
  semi: true,
  noJsx: true
});

for (const conf of ns) {
  if (
    conf.name === 'neostandard/base' ||
    conf.name === 'neostandard/modernization-since-standard-17' ||
    conf.name === 'neostandard/style' ||
    conf.name === 'neostandard/style/modernization-since-standard-17' ||
    conf.name === 'neostandard/semi'
  ) {
    conf.files = ['**/*.js', '**/*.cjs', '**/*.mjs'];
  }
}

export default defineConfig([
  ...ns,
  ini.configs.npmrc
]);
```

#### Rules

**`require-field`**: Require fields to be present

```javascript
rules: {
  'ini/require-field': [
    'error', // error or warn
    ['foo', 'bar'] // list of required fields
  ]
}
```

**`delim-whitespace`**: Standardize whitespace around the `=` delimiter

```javascript
rules: {
  'ini/delim-whitespace': [
    'error', // error or warn
    'none' // none or single-space
  ]
}
```

**`trailing-whitespace`**: Remove trailing whitespace on lines

```javascript
rules: {
  'ini/trailing-whitespace': [
    'error' // error or warn
  ]
}
```

**`duplicate-keys`**: Disallow duplicate keys

```javascript
rules: {
  'ini/duplicate-keys': [
    'error' // error or warn
  ]
}
```

**`npmrc-registry`**: Set registry configurations

```javascript
rules: {
  'ini/npmrc-registry': [
    'error', // error or warn
    'https://registry.npmjs.com/', // a default registry url or an object (see below)
    true // strict mode disallows unknown registries
  ]
}
```

Setting scoped registries and optional registries can be done by passing an object:

```javascript
rules: {
  'ini/npmrc-registry': [
    'error', // error or warn
    {
      // Can still set a string URL value
      default: 'https://registry.npmjs.com',
      // Require the scope @foo to be present with this url
      '@foo': {
        url: 'https://registry.foo.com/',
        required: true
      },
      // If the scope @bar is present it must use this url
      '@bar': {
        url: 'https://registry.bar.com/',
        required: false
      }
    }
  ]
}
```

**`npmrc-legacy-peer-deps`**: Require fields to be present

```javascript
rules: {
  'ini/require-field': [
    'error', // error or warn
    'absent' // absent, true, false (as strings, uses this value directly in fixes)
  ]
}
```

### Usage with neovim/conform

To enable linting/fixing automatically in neovim via conform, you can use the 'dosini' filetype:

```lua
return {
  "stevearc/conform.nvim",
  opts = {
    formatters_by_ft = {
      -- lint ini/.npmrc files
      dosini = { "eslint_d" },
    },
  },
}
```
