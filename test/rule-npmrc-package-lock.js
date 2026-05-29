import { suite, test, before } from 'mocha';
import assert from 'node:assert';
import plugin from '../index.js';

suite('rule: npmrc-package-lock', () => {
  let ESLint;
  before(async () => {
    const eslint = await import(process.env.TEST_ESLINT_IMPORT);
    ESLint = eslint.ESLint;
  });

  test('no package-lock in npmrc', async () => {
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
          'ini/npmrc-package-lock': ['error']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 2);

    for (const msg of results[0].messages) {
      assert.strictEqual(msg.ruleId, 'ini/npmrc-package-lock');
      assert.strictEqual(msg.message, 'package-lock should be removed');
      assert(results[0].source.slice(msg.fix.range[0], msg.fix.range[1]).match(/^package-lock=(true|false)\n$/i));
    }
  });

  test('remove package-lock', async () => {
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
          'ini/npmrc-package-lock': ['error', 'absent']
        }
      }
    });
    const results = await eslint.lintText('package-lock=true\npackage-lock=false', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, '');
  });

  test('set package-lock=true', async () => {
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
          'ini/npmrc-package-lock': ['error', 'true']
        }
      }
    });
    const results = await eslint.lintText('package-lock=false', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'package-lock=true');
  });

  test('set package-lock=false', async () => {
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
          'ini/npmrc-package-lock': ['error', 'false']
        }
      }
    });
    const results = await eslint.lintText('package-lock=true', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'package-lock=false');
  });
});
