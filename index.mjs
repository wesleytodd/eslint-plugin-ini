import fs from 'fs';
import INIParser from './lib/language.mjs';

import requireFieldRule from './lib/rules/require-field.mjs';
import delimWhitespace from './lib/rules/delim-whitespace.mjs';
import trailingWhitespace from './lib/rules/trailing-whitespace.mjs';
import duplicateKeys from './lib/rules/duplicate-keys.mjs';

import npmrcRegistry from './lib/rules/npmrc/registry.mjs';
import npmrcLegacyPeerDeps from './lib/rules/npmrc/legacy-peer-deps.mjs';

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
  },
  configs: { }
};

plugin.configs.recommended = {
  name: 'ini/recommended',
  plugins: {
    ini: plugin
  },
  language: 'ini/ini',
  files: ['**/*.ini'],
  rules: {
    'ini/delim-whitespace': ['error', 'none'],
    'ini/trailing-whitespace': ['error'],
    'ini/duplicate-keys': ['error']
  }
};

plugin.configs.npmrc = {
  name: 'ini/npmrc',
  plugins: {
    ini: plugin
  },
  language: 'ini/ini',
  files: ['.npmrc'],
  rules: {
    ...plugin.configs.recommended.rules,
    'ini/npmrc-registry': ['warn', 'https://registry.npmjs.com/'],
    'ini/npmrc-legacy-peer-deps': ['warn', 'absent']
  }
};

export default plugin;
