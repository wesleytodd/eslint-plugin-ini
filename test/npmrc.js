import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.js';

suite('npmrc config', () => {
  test('lint .npmrc files', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: plugin.configs.npmrc
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 13);

    for (const msg of results[0].messages) {
      switch (msg.ruleId) {
        case 'ini/npmrc-legacy-peer-deps':
        case 'ini/npmrc-registry':
          assert.strictEqual(msg.severity, 1);
          break;
        case 'ini/npmrc-email':
        case 'ini/npmrc-always-auth':
        case 'ini/duplicate-keys':
        case 'ini/npmrc-no-auth':
          assert.strictEqual(msg.severity, 2);
          break;
        default:
          throw new Error(`found unexpeced rule message: ${msg.ruleId}`);
      }
    }
  });

  test('fixes .npmrc files', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: plugin.configs.npmrc,
      fix: true
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.notStrictEqual(results[0].source, results[0].output);
  });

  test('reports .npmrc findings in case there are more than two keys', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: plugin.configs.npmrc
    });

    const results = await eslint.lintText(`
      _auth = dummy-token
      _auth = dummy-token
      _auth = dummy-token
      `, { filePath: '.npmrc' });

    const duplicateKeyFindings = results[0].messages.filter(o => o.ruleId === 'ini/duplicate-keys');
    assert.strictEqual(duplicateKeyFindings.length, 3);
  });
});
