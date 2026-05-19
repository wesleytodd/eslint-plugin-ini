import { suite, test, before } from 'mocha';
import assert from 'node:assert';
import plugin from '../index.js';

suite('rule: npmrc-ssl-strict', () => {
  let ESLint;
  before(async () => {
    const eslint = await import(process.env.TEST_ESLINT_IMPORT);
    ESLint = eslint.ESLint;
  });

  test('no ssl-strict in npmrc', async () => {
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
          'ini/npmrc-ssl-strict': ['error']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 2);

    for (const msg of results[0].messages) {
      assert.strictEqual(msg.ruleId, 'ini/npmrc-ssl-strict');
      assert.strictEqual(msg.message, 'ssl-strict should be removed');
      assert(results[0].source.slice(msg.fix.range[0], msg.fix.range[1]).match(/^ssl-strict=(true|false)\n$/i));
    }
  });

  test('remove ssl-strict', async () => {
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
          'ini/npmrc-ssl-strict': ['error', 'absent']
        }
      }
    });
    const results = await eslint.lintText('ssl-strict=true\nssl-strict=false', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, '');
  });

  test('set ssl-strict=true', async () => {
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
          'ini/npmrc-ssl-strict': ['error', 'true']
        }
      }
    });
    const results = await eslint.lintText('ssl-strict=false', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'ssl-strict=true');
  });

  test('set ssl-strict=false', async () => {
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
          'ini/npmrc-ssl-strict': ['error', 'false']
        }
      }
    });
    const results = await eslint.lintText('ssl-strict=true', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'ssl-strict=false');
  });
});
