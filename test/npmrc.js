import { suite, test, before } from 'mocha';
import assert from 'node:assert';
import plugin from '../index.js';

suite('npmrc config', () => {
  let ESLint;
  before(async () => {
    const eslint = await import(process.env.TEST_ESLINT_IMPORT);
    ESLint = eslint.ESLint;
  });

  test('lint .npmrc files', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: plugin.configs.npmrc
    });
    const results = await eslint.lintFiles('fixtures/.npmrc');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 17);

    for (const msg of results[0].messages) {
      switch (msg.ruleId) {
        case 'ini/npmrc-legacy-peer-deps':
        case 'ini/npmrc-registry':
        case 'ini/npmrc-ssl-strict':
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

  test('fixes .npmrc findings in case there are more than two keys', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: plugin.configs.npmrc,
      fix: true
    });

    const results = await eslint.lintText([
      // Tests that this plays well with registry fix
      'registry=https://registry.npmjs.com/',
      'registry=https://registry.npmjs.com/',
      'registry=https://registry.other.com/',
      // Tests that this plays well with no-auth
      '_auth=dummy-token',
      '_auth=dummy-token',
      '_auth=dummy-token',
      // Tests that this plays well other keys that wont be removed
      'min-release-age=1',
      'min-release-age=1',
      'min-release-age=1'
    ].join('\n'), { filePath: '.npmrc' });

    const duplicateKeyFindings = results[0].messages.filter(o => o.ruleId === 'ini/duplicate-keys');
    assert.strictEqual(duplicateKeyFindings.length, 0);
    assert.strictEqual(results[0].output, 'registry=https://registry.npmjs.com/\nmin-release-age=1\n');
  });
});
