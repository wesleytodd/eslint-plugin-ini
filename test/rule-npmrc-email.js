import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.js';

suite('rule: npmrc-email', () => {
  test('no email in npmrc', async () => {
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
          'ini/npmrc-email': ['error']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);

    assert.strictEqual(results[0].messages[0].ruleId, 'ini/npmrc-email');
    assert.strictEqual(results[0].messages[0].message, 'email is deprecated and should be removed');
    assert.strictEqual(results[0].messages[0].line, 6);
    assert.strictEqual(results[0].messages[0].column, 1);
    assert.strictEqual(results[0].messages[0].endLine, 6);
    assert.strictEqual(results[0].messages[0].endColumn, 20);
  });

  test('remove email in npmrc', async () => {
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
          'ini/npmrc-email': ['error']
        }
      }
    });
    const results = await eslint.lintText('email=foo@gmail.com', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, '');
  });
});
