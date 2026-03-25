import { defineConfig } from 'eslint/config';
import neostandard from 'neostandard';
import ini from './index.mjs';

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
