import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.mjs';

suite('eslint-plugin-ini', () => {
  test('process ini format', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['file.ini'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/require-field': ['error', ['foo', 'bar']]
        }
      }
    });
    const results = await eslint.lintText('foo=bar', {
      filePath: 'file.ini'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);
    assert.strictEqual(results[0].messages[0].ruleId, 'ini/require-field');
    assert.strictEqual(results[0].messages[0].message, '`bar` is a required field');
    assert.strictEqual(results[0].messages[0].line, 1);
    assert.strictEqual(results[0].messages[0].column, 1);
    assert.strictEqual(results[0].messages[0].endLine, 1);
    assert.strictEqual(results[0].messages[0].endColumn, 8);
  });

  test('process ini sections', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['file.ini'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/require-field': ['error', ['foo.bar', 'foo.baz']]
        }
      }
    });
    const results = await eslint.lintText('[foo]\nbar=baz', {
      filePath: 'file.ini'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);
    assert.strictEqual(results[0].messages[0].ruleId, 'ini/require-field');
    assert.strictEqual(results[0].messages[0].message, '`foo.baz` is a required field');
  });

  test('process keys with nesting', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['file.ini'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        languageOptions: {
          compositeKeys: true
        },
        rules: {
          'ini/require-field': ['error', [
            'foo',
            'foo.bar',
            'foo.bar.baz',
            'foo.bar.baz.bam',
            'miss.ing'
          ]]
        }
      }
    });
    const results = await eslint.lintText('[foo.bar]\nbaz.bam=wiz', {
      filePath: 'file.ini'
    });
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);
    assert.strictEqual(results[0].messages[0].ruleId, 'ini/require-field');
    assert.strictEqual(results[0].messages[0].message, '`miss.ing` is a required field');
  });

  test('fix ini formatting', async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      fix: true,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['fixtures/foo.ini'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/require-field': ['error', ['foo', 'bar']],
          'ini/trailing-whitespace': ['error']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/foo.ini', {
      filePath: 'fixtures/foo.ini'
    });

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'foo=bar\nbar=baz\n');
  });

  test.skip('parses complex ini files', async () => {
    // TODO: left off parsing the crazy escaping on line 8
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: true,
      overrideConfig: {
        files: ['**/*.ini'],
        plugins: {
          ini: plugin
        },
        language: 'ini/ini',
        rules: {
          'ini/require-field': ['error', [
            'o',
            'a.b',
            'a.b.c',
            'x.y.z.x.y.z',
            'foo.bar'
          ]]
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/complex.ini');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 1);
    assert.strictEqual(results[0].messages[0].ruleId, 'ini/require-field');
    assert.strictEqual(results[0].messages[0].message, '`foo.bar` is a required field');
  });
});
