import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.mjs';

suite('eslint npmrc config', () => {
  test('require a default registry', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: plugin.configs.npmrc
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 8);

    assert.strictEqual(results[0].messages[0].ruleId, 'ini/npmrc-legacy-peer-deps');
    assert.strictEqual(results[0].messages[0].message, 'legacy-peer-deps should not be set');
    assert.strictEqual(results[0].messages[0].line, 5);
    assert.strictEqual(results[0].messages[0].column, 1);
    assert.strictEqual(results[0].messages[0].endLine, 5);
    assert.strictEqual(results[0].messages[0].endColumn, 22);

    assert.strictEqual(results[0].messages[1].ruleId, 'ini/npmrc-email');
    assert.strictEqual(results[0].messages[1].message, 'email is deprecated and should be removed');
    assert.strictEqual(results[0].messages[1].line, 6);
    assert.strictEqual(results[0].messages[1].column, 1);
    assert.strictEqual(results[0].messages[1].endLine, 6);
    assert.strictEqual(results[0].messages[1].endColumn, 20);

    assert.strictEqual(results[0].messages[2].ruleId, 'ini/npmrc-always-auth');
    assert.strictEqual(results[0].messages[2].message, 'always-auth is deprecated and should be removed');
    assert.strictEqual(results[0].messages[2].line, 7);
    assert.strictEqual(results[0].messages[2].column, 1);
    assert.strictEqual(results[0].messages[2].endLine, 7);
    assert.strictEqual(results[0].messages[2].endColumn, 17);

    assert.strictEqual(results[0].messages[3].ruleId, 'ini/npmrc-no-auth');
    assert.strictEqual(results[0].messages[3].message, 'remove auth tokens');
    assert.strictEqual(results[0].messages[3].line, 8);
    assert.strictEqual(results[0].messages[3].column, 1);
    assert.strictEqual(results[0].messages[3].endLine, 8);
    assert.strictEqual(results[0].messages[3].endColumn, 20);

    assert.strictEqual(results[0].messages[4].ruleId, 'ini/npmrc-no-auth');
    assert.strictEqual(results[0].messages[4].message, 'remove auth tokens');
    assert.strictEqual(results[0].messages[4].line, 9);
    assert.strictEqual(results[0].messages[4].column, 1);
    assert.strictEqual(results[0].messages[4].endLine, 9);
    assert.strictEqual(results[0].messages[4].endColumn, 25);

    assert.strictEqual(results[0].messages[5].ruleId, 'ini/npmrc-no-auth');
    assert.strictEqual(results[0].messages[5].message, 'remove auth tokens');
    assert.strictEqual(results[0].messages[5].line, 10);
    assert.strictEqual(results[0].messages[5].column, 1);
    assert.strictEqual(results[0].messages[5].endLine, 10);
    assert.strictEqual(results[0].messages[5].endColumn, 48);

    assert.strictEqual(results[0].messages[6].ruleId, 'ini/npmrc-no-auth');
    assert.strictEqual(results[0].messages[6].message, 'remove auth tokens');
    assert.strictEqual(results[0].messages[6].line, 11);
    assert.strictEqual(results[0].messages[6].column, 1);
    assert.strictEqual(results[0].messages[6].endLine, 11);
    assert.strictEqual(results[0].messages[6].endColumn, 53);

    assert.strictEqual(results[0].messages[7].ruleId, 'ini/npmrc-registry');
    assert.strictEqual(results[0].messages[7].message, 'registry is required to match https://registry.npmjs.com/');
    assert.strictEqual(results[0].messages[7].line, 11);
    assert.strictEqual(results[0].messages[7].column, 34);
    assert.strictEqual(results[0].messages[7].endLine, 11);
    assert.strictEqual(results[0].messages[7].endColumn, 53);
  });
});
