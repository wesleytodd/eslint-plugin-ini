import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.mjs';

suite('eslint .npmrc rules', () => {
  test('require a default registry', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['.npmrc'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/npmrc-registry': ['error', 'https://registry.npmjs.com/']
        }
      }
    });
    const results = await eslint.lintText('registry=http://registry.npmjs.org', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);
    assert.strictEqual(results[0].messages[0].ruleId, 'ini/npmrc-registry');
    assert.strictEqual(results[0].messages[0].message, 'registry is required to match https://registry.npmjs.com/');
    assert.strictEqual(results[0].messages[0].line, 1);
    assert.strictEqual(results[0].messages[0].column, 10);
    assert.strictEqual(results[0].messages[0].endLine, 1);
    assert.strictEqual(results[0].messages[0].endColumn, 35);
  });

  test('fix a default registry value', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      fix: true,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['.npmrc'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/npmrc-registry': ['error', 'https://registry.npmjs.com/']
        }
      }
    });
    const results = await eslint.lintText('registry=http://registry.npmjs.org', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'registry=https://registry.npmjs.com/');
  });

  test('required and optional registries', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['fixtures/.npmrc'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/npmrc-registry': ['error', {
            default: 'https://registry.npmjs.com',
            '@foo': {
              url: 'https://registry.foo.com/',
              required: true
            },
            '@bar': {
              url: 'https://registry.bar.com/',
              required: false
            }
          }, true]
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 2);

    assert.strictEqual(results[0].messages[0].ruleId, 'ini/npmrc-registry');
    assert.strictEqual(results[0].messages[0].message, 'registry is required to match https://registry.npmjs.com');
    assert.strictEqual(results[0].messages[0].line, 1);
    assert.strictEqual(results[0].messages[0].column, 10);
    assert.strictEqual(results[0].messages[0].endLine, 1);
    assert.strictEqual(results[0].messages[0].endColumn, 37);

    assert.strictEqual(results[0].messages[1].ruleId, 'ini/npmrc-registry');
    assert.strictEqual(results[0].messages[1].message, 'unknown registry for @baz');
    assert.strictEqual(results[0].messages[1].line, 4);
    assert.strictEqual(results[0].messages[1].column, 1);
    assert.strictEqual(results[0].messages[1].endLine, 4);
    assert.strictEqual(results[0].messages[1].endColumn, 40);
  });

  test('fix required and optional registries', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      fix: true,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['fixtures/.npmrc'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/npmrc-registry': ['error', {
            // NOTE:: no trailing slash tests fixing values
            default: 'https://registry.npmjs.com',
            '@foo': {
              url: 'https://registry.foo.com',
              required: true
            },
            '@bar': {
              url: 'https://registry.bar.com',
              required: false
            }
          }, true]
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'registry=https://registry.npmjs.com\n@foo:registry=https://registry.foo.com\n@bar:registry=https://registry.bar.com\nlegacy-peer-deps=true\n');
  });
});
