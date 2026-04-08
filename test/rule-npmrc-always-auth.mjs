import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.mjs';

suite('rule: npmrc-always-auth', () => {
  test('no always-auth in npmrc', async () => {
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
          'ini/npmrc-always-auth': ['error']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);

    assert.strictEqual(results[0].messages[0].ruleId, 'ini/npmrc-always-auth');
    assert.strictEqual(results[0].messages[0].message, 'always-auth is deprecated and should be removed');
    assert.strictEqual(results[0].messages[0].line, 7);
    assert.strictEqual(results[0].messages[0].column, 1);
    assert.strictEqual(results[0].messages[0].endLine, 7);
    assert.strictEqual(results[0].messages[0].endColumn, 17);
  });

  test('remove always-auth in npmrc', async () => {
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
          'ini/npmrc-always-auth': ['error']
        }
      }
    });
    const results = await eslint.lintText('always-auth=true', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, '');
  });
});
