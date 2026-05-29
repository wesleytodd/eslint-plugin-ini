import fs from 'fs';
import INIParser from './lib/language.js';

import stylistic from '@stylistic/eslint-plugin';

import requireFieldRule from './lib/rules/require-field.js';
import delimWhitespace from './lib/rules/delim-whitespace.js';
import trailingWhitespace from './lib/rules/trailing-whitespace.js';
import duplicateKeys from './lib/rules/duplicate-keys.js';

import npmrcRegistry from './lib/rules/npmrc/registry.js';
import npmrcLegacyPeerDeps from './lib/rules/npmrc/legacy-peer-deps.js';
import npmrcEmail from './lib/rules/npmrc/email.js';
import npmrcAlwaysAuth from './lib/rules/npmrc/always-auth.js';
import npmrcNoAuth from './lib/rules/npmrc/no-auth.js';
import npmrcSSLStrict from './lib/rules/npmrc/strict-ssl.js';
import npmrcLegacyBundling from './lib/rules/npmrc/legacy-bundling.js';
import npmrcEngineStrict from './lib/rules/npmrc/engine-strict.js';
import npmrcPackageLock from './lib/rules/npmrc/package-lock.js';

const pkg = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

const plugin = {
  meta: {
    name: pkg.name,
    version: pkg.version
  },
  languages: {
    ini: new INIParser()
  },
  rules: {
    'require-field': requireFieldRule,
    'delim-whitespace': delimWhitespace,
    'trailing-whitespace': trailingWhitespace,
    'duplicate-keys': duplicateKeys,
    'npmrc-registry': npmrcRegistry,
    'npmrc-legacy-peer-deps': npmrcLegacyPeerDeps,
    'npmrc-email': npmrcEmail,
    'npmrc-always-auth': npmrcAlwaysAuth,
    'npmrc-no-auth': npmrcNoAuth,
    'npmrc-strict-ssl': npmrcSSLStrict,
    'npmrc-legacy-bundling': npmrcLegacyBundling,
    'npmrc-engine-strict': npmrcEngineStrict,
    'npmrc-package-lock': npmrcPackageLock
  },
  configs: { }
};

plugin.configs.recommended = {
  name: 'ini/recommended',
  plugins: {
    '@stylistic': stylistic,
    ini: plugin
  },
  language: 'ini/ini',
  files: ['**/*.ini'],
  rules: {
    'ini/delim-whitespace': ['error', 'none'],
    'ini/trailing-whitespace': ['error'],
    'ini/duplicate-keys': ['error'],
    '@stylistic/eol-last': ['error', 'always']
  }
};

plugin.configs.npmrc = {
  name: 'ini/npmrc',
  plugins: {
    ...plugin.configs.recommended.plugins
  },
  language: 'ini/ini',
  files: ['**/.npmrc'],
  rules: {
    ...plugin.configs.recommended.rules,
    'ini/npmrc-registry': ['warn', 'https://registry.npmjs.com/'],
    'ini/npmrc-legacy-peer-deps': ['warn', 'absent'],
    'ini/npmrc-email': ['error'],
    'ini/npmrc-always-auth': ['error'],
    'ini/npmrc-no-auth': ['error'],
    'ini/npmrc-strict-ssl': ['warn'],
    'ini/npmrc-legacy-bundling': ['error'],
    'ini/npmrc-engine-strict': ['off'],
    'ini/npmrc-package-lock': ['error']
  }
};

export default plugin;
