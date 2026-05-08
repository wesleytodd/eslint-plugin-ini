import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.js';

suite('rule: npmrc-registry', () => {
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
    assert.strictEqual(results[0].messages[0].message, 'default registry is required to match https://registry.npmjs.com/');
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
            },
            '@baz': {
              url: 'https://registry.baz.com/'
            },
            '@missing': {
              url: 'https://registry.missing.com/',
              required: false
            }
          }, true]
        }
      }
    });
    const results = await eslint.lintText([
      'registry=https://registry.npmjs.com/',
      '@foo:registry=https://registry.foo.com/',
      '@bar:registry=https://registry.bar.com/',
      '@baz:registry=https://registry.bad.com/',
      '@other:registry=https://registry.other.com/'
    ].join('\n'), {
      filePath: 'fixtures/.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 3);

    for (const msg of results[0].messages) {
      assert.strictEqual(msg.ruleId, 'ini/npmrc-registry');
      switch (msg.messageId) {
        case 'incorrectDefaultRegistry':
          assert.strictEqual(msg.message, 'default registry is required to match https://registry.npmjs.com');
          break;
        case 'incorrectScopedRegistry':
          assert.strictEqual(msg.message, 'registry for @baz is required to match https://registry.baz.com/');
          break;
        case 'unknownRegistry':
          assert.strictEqual(msg.message, 'unknown registry for @other');
          break;

        default:
          throw new Error(`unrecognized messageId ${msg.messageId}`);
      }

      // Should not error or complain about the not-required @missing scope
      assert(!msg.message.includes('@missing'));
    }
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
    const results = await eslint.lintText([
      'registry=https://registry.npmjs.com/',
      '@foo:registry=https://registry.foo.com/',
      '@bar:registry=https://registry.bar.com/',
      '@baz:registry=https://registry.baz.com/'
    ].join('\n'), {
      filePath: 'fixtures/.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'registry=https://registry.npmjs.com\n@foo:registry=https://registry.foo.com\n@bar:registry=https://registry.bar.com\n');
  });
});
