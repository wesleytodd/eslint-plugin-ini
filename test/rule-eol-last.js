import { suite, test, before } from 'mocha';
import assert from 'node:assert';
import plugin from '../index.js';
import stylistic from '@stylistic/eslint-plugin';

suite('rule: @stylistic/eol-last', () => {
  let ESLint;
  before(async () => {
    const eslint = await import(process.env.TEST_ESLINT_IMPORT);
    ESLint = eslint.ESLint;
  });

  test('always', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['**/*.ini'],
        plugins: {
          '@stylistic': stylistic,
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          '@stylistic/eol-last': ['error', 'always']
        }
      }
    });
    const results = await eslint.lintText('foo=bar', {
      filePath: 'file.ini'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);

    assert.strictEqual(results[0].messages[0].ruleId, '@stylistic/eol-last');
    assert.strictEqual(results[0].messages[0].message, 'Newline required at end of file but not found.');
  });

  test('never', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['**/*.ini'],
        plugins: {
          '@stylistic': stylistic,
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          '@stylistic/eol-last': ['error', 'never']
        }
      }
    });
    const results = await eslint.lintText('foo=bar\n', {
      filePath: 'file.ini'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);

    assert.strictEqual(results[0].messages[0].ruleId, '@stylistic/eol-last');
    assert.strictEqual(results[0].messages[0].message, 'Newline not allowed at end of file.');
  });
});
