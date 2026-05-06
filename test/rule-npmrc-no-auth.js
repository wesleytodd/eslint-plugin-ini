import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.js';

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
    assert.strictEqual(results[0].messages.length, 6);

    for (const msg of results[0].messages) {
      assert.strictEqual(msg.ruleId, 'ini/npmrc-no-auth');
      assert.strictEqual(msg.message, 'remove auth tokens');
      assert(results[0].source.slice(msg.fix.range[0], msg.fix.range[1]).match(/^(.*:)?_(auth(Token)?|password)=.*\n$/i));
      assert.strictEqual(msg.fix.text, '');
    }
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
    const results = await eslint.lintText(`
_auth=asfasdfdsfsd
_authToken=asfasdfdsfsdf
_password=asfasdfdsfsdf
//registry.npmjs.com/:_auth="asdfasdasdfdasdf="
//registry.npmjs.com/:_authToken="asdfasdasdfdasdf="
//registry.npmjs.com/:_password="asdfasdasdfdasdf="
    `.trim(), {
      filePath: '.npmrc'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, '');
  });
});
