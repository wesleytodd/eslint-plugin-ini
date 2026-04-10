import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.mjs';

suite('rule: npmrc-no-auth', () => {
  test('no auth in npmrc', async () => {
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
          'ini/npmrc-no-auth': ['error']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 4);

    assert.strictEqual(results[0].messages[0].ruleId, 'ini/npmrc-no-auth');
    assert.strictEqual(results[0].messages[0].message, 'remove auth tokens');
    assert.strictEqual(results[0].messages[0].line, 7);
    assert.strictEqual(results[0].messages[0].column, 1);
    assert.strictEqual(results[0].messages[0].endLine, 7);
    assert.strictEqual(results[0].messages[0].endColumn, 20);

    assert.strictEqual(results[0].messages[1].ruleId, 'ini/npmrc-no-auth');
    assert.strictEqual(results[0].messages[1].message, 'remove auth tokens');
    assert.strictEqual(results[0].messages[1].line, 8);
    assert.strictEqual(results[0].messages[1].column, 1);
    assert.strictEqual(results[0].messages[1].endLine, 8);
    assert.strictEqual(results[0].messages[1].endColumn, 20);

    assert.strictEqual(results[0].messages[2].ruleId, 'ini/npmrc-no-auth');
    assert.strictEqual(results[0].messages[2].message, 'remove auth tokens');
    assert.strictEqual(results[0].messages[2].line, 9);
    assert.strictEqual(results[0].messages[2].column, 1);
    assert.strictEqual(results[0].messages[2].endLine, 9);
    assert.strictEqual(results[0].messages[2].endColumn, 20);

    assert.strictEqual(results[0].messages[3].ruleId, 'ini/npmrc-no-auth');
    assert.strictEqual(results[0].messages[3].message, 'remove auth tokens');
    assert.strictEqual(results[0].messages[3].line, 10);
    assert.strictEqual(results[0].messages[3].column, 1);
    assert.strictEqual(results[0].messages[3].endLine, 10);
    assert.strictEqual(results[0].messages[3].endColumn, 20);
  });

  test('remove auth in npmrc', async () => {
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
          'ini/npmrc-no-auth': ['error']
        }
      }
    });
    const results = await eslint.lintText('_auth=asfasdfdsfsdf\n_authToken=asfasdfdsfsdf\n//registry.npmjs.com/:_auth="asdfasdasdfdasdf="\nregistry.npmjs.com/:_authToken="asdfasdasdfdasdf="', {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, '');
  });
});
