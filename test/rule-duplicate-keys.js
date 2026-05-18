import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.js';

suite('rule: duplicate-keys', () => {
  test('fixes duplicate keys when value is the same', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      fix: true,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['**/*.ini'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/duplicate-keys': ['error']
        }
      }
    });
    const results = await eslint.lintText([
      'foo=bar',
      'foo=bar',
      'foo=bar',
      'foo=baz'
    ].join('\n'), {
      filePath: 'file.ini'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 2);
    results[0].messages.forEach(o => assert.strictEqual(o.ruleId, 'ini/duplicate-keys'));
    assert.strictEqual(results[0].output, 'foo=bar\nfoo=baz');
  });
});
