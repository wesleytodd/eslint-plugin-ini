import { suite, test, before } from 'mocha';
import assert from 'node:assert';
import plugin from '../index.js';

suite('rule: npmrc-legacy-bundling', () => {
  let ESLint;
  before(async () => {
    const eslint = await import(process.env.TEST_ESLINT_IMPORT);
    ESLint = eslint.ESLint;
  });

  test('no legacy-bundling in npmrc', async () => {
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
          'ini/npmrc-legacy-bundling': ['error']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 2);

    for (const msg of results[0].messages) {
      assert.strictEqual(msg.ruleId, 'ini/npmrc-legacy-bundling');
      assert.strictEqual(msg.message, 'legacy-bundling is deprecated and should be removed');
      assert(results[0].source.slice(msg.fix.range[0], msg.fix.range[1]).match(/^legacy-bundling=(true|false)\n$/i));
    }
  });

  test('remove legacy-bundling', async () => {
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
          'ini/npmrc-legacy-bundling': ['error']
        }
      }
    });
    const results = await eslint.lintText('legacy-bundling=true\nlegacy-bundling=false', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, '');
  });
});
