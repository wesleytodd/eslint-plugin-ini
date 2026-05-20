# ESLint plugin for ini files

Lint `ini` format files (ex. `.npmrc`) along with your JavaScript.

## Usage

```bash
npm install -D eslint @wesleytodd/eslint-plugin-ini
```

```javascript
// eslint.config.js
import { defineConfig } from 'eslint/config';
import ini from '@wesleytodd/eslint-plugin-ini';

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

##### Basic

**`require-field`**: Require fields to be present

Fixable: :x:

```javascript
rules: {
  'ini/require-field': [
    'error', // off, error, or warn
    ['foo', 'bar'] // list of required fields
  ]
}
```

**`delim-whitespace`**: Standardize whitespace around the `=` delimiter

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/delim-whitespace': [
    'error', // off, error, or warn
    'none' // none or single-space
  ]
}
```

**`trailing-whitespace`**: Remove trailing whitespace on lines

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/trailing-whitespace': [
    'error' // off, error, or warn
  ]
}
```

**`duplicate-keys`**: Disallow duplicate keys

Fixable: :heavy_exclamation_mark: Will remove the line if the *values* match.

```javascript
rules: {
  'ini/duplicate-keys': [
    'error' // off, error, or warn
  ]
}
```

##### .npmrc

**`npmrc-registry`**: Set registry configurations

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/npmrc-registry': [
    'warn', // off, error, or warn
    'https://registry.npmjs.com/', // a default registry url or an object (see below)
    false // `strict: true`` mode disallows unknown registries
  ]
}
```

Setting scoped registries and optional registries can be done by passing an object:

```javascript
rules: {
  'ini/npmrc-registry': [
    'error', // off, error, or warn
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

*Strict mode* (the third option) will remove additional scoped registries which are not present in the options. It will
*not* remove optional registries but *will* ensure they point to the right url if they are present.

**`npmrc-legacy-peer-deps`**: Require, disallow, or set `legacy-peer-deps`

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/npmrc-legacy-peer-deps': [
    'warn', // off, error, or warn
    'absent' // absent, true, false (as strings, uses this value directly in fixes)
  ]
}
```

**`npmrc-email`**: Remove deprecated `email` field

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/npmrc-email': [
    'error' // off, error, or warn
  ]
}
```

**`npmrc-always-auth`**: Remove deprecated `always-auth` field (including registry scoped variants)

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/npmrc-always-auth': [
    'error' // off, error, or warn
  ]
}
```

**`npmrc-no-auth`**: Remove any auth tokens

Fixable: :white_check_mark:

Removes (and their registry scoped variants): `_auth`, `_authToken`, `_password`

```javascript
rules: {
  'ini/npmrc-no-auth': [
    'error' // off, error, or warn
  ]
}
```

**`npmrc-ssl-strict`**: Require, disallow, or set `ssl-strict` 

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/npmrc-ssl-strict': [
    'warn', // off, error, or warn
    'absent' // absent, true, false (as strings, uses this value directly in fixes)
  ]
}
```

**`npmrc-engine-strict`**: Require, disallow or set `engines-strict`

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/npmrc-engine-strict': [
    'off', // off, error, or warn
    'absent' // absent, true, false (as strings, uses this value directly in fixes)
  ]
}
```

**`npmrc-legacy-bundling`**: Remove deprecated `legacy-bundling` setting

Fixable: :white_check_mark:

```javascript
rules: {
  'ini/npmrc-legacy-bundling': [
    'error' // off, error, or warn
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
