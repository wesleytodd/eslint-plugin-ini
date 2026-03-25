import { suite, test } from 'mocha';
import { ESLint } from 'eslint';
import assert from 'node:assert';
import plugin from '../index.mjs';

suite('rule: delim-whitespace', () => {
  test('no delim whitespace', async () => {
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
          'ini/delim-whitespace': ['error', 'none']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/delim-spaces.ini');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 8);

    assert.strictEqual(results[0].messages[0].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[0].message, 'unexpected whitespace before delimiter');
    assert.strictEqual(results[0].messages[0].line, 2);
    assert.strictEqual(results[0].messages[0].column, 4);
    assert.strictEqual(results[0].messages[0].endLine, 2);
    assert.strictEqual(results[0].messages[0].endColumn, 5);

    assert.strictEqual(results[0].messages[1].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[1].message, 'unexpected whitespace after delimiter');
    assert.strictEqual(results[0].messages[1].line, 2);
    assert.strictEqual(results[0].messages[1].column, 6);
    assert.strictEqual(results[0].messages[1].endLine, 2);
    assert.strictEqual(results[0].messages[1].endColumn, 7);

    assert.strictEqual(results[0].messages[2].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[2].message, 'unexpected whitespace before delimiter');
    assert.strictEqual(results[0].messages[2].line, 3);
    assert.strictEqual(results[0].messages[2].column, 4);
    assert.strictEqual(results[0].messages[2].endLine, 3);
    assert.strictEqual(results[0].messages[2].endColumn, 6);

    assert.strictEqual(results[0].messages[3].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[3].message, 'unexpected whitespace after delimiter');
    assert.strictEqual(results[0].messages[3].line, 3);
    assert.strictEqual(results[0].messages[3].column, 7);
    assert.strictEqual(results[0].messages[3].endLine, 3);
    assert.strictEqual(results[0].messages[3].endColumn, 9);

    assert.strictEqual(results[0].messages[4].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[4].message, 'unexpected whitespace before delimiter');
    assert.strictEqual(results[0].messages[4].line, 4);
    assert.strictEqual(results[0].messages[4].column, 5);
    assert.strictEqual(results[0].messages[4].endLine, 4);
    assert.strictEqual(results[0].messages[4].endColumn, 6);

    assert.strictEqual(results[0].messages[5].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[5].message, 'unexpected whitespace after delimiter');
    assert.strictEqual(results[0].messages[5].line, 4);
    assert.strictEqual(results[0].messages[5].column, 7);
    assert.strictEqual(results[0].messages[5].endLine, 4);
    assert.strictEqual(results[0].messages[5].endColumn, 9);

    assert.strictEqual(results[0].messages[6].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[6].message, 'unexpected whitespace after delimiter');
    assert.strictEqual(results[0].messages[6].line, 5);
    assert.strictEqual(results[0].messages[6].column, 6);
    assert.strictEqual(results[0].messages[6].endLine, 5);
    assert.strictEqual(results[0].messages[6].endColumn, 7);

    assert.strictEqual(results[0].messages[7].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[7].message, 'unexpected whitespace before delimiter');
    assert.strictEqual(results[0].messages[7].line, 6);
    assert.strictEqual(results[0].messages[7].column, 5);
    assert.strictEqual(results[0].messages[7].endLine, 6);
    assert.strictEqual(results[0].messages[7].endColumn, 6);
  });

  test('single delim whitespace', async () => {
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
          'ini/delim-whitespace': ['error', 'single-space']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/delim-spaces.ini');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 8);

    assert.strictEqual(results[0].messages[0].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[0].message, 'unexpected whitespace before delimiter');
    assert.strictEqual(results[0].messages[0].line, 1);
    assert.strictEqual(results[0].messages[0].column, 4);
    assert.strictEqual(results[0].messages[0].endLine, 1);
    assert.strictEqual(results[0].messages[0].endColumn, 5);

    assert.strictEqual(results[0].messages[1].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[1].message, 'unexpected whitespace after delimiter');
    assert.strictEqual(results[0].messages[1].line, 1);
    assert.strictEqual(results[0].messages[1].column, 4);
    assert.strictEqual(results[0].messages[1].endLine, 1);
    assert.strictEqual(results[0].messages[1].endColumn, 5);

    assert.strictEqual(results[0].messages[2].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[2].message, 'unexpected whitespace before delimiter');
    assert.strictEqual(results[0].messages[2].line, 3);
    assert.strictEqual(results[0].messages[2].column, 4);
    assert.strictEqual(results[0].messages[2].endLine, 3);
    assert.strictEqual(results[0].messages[2].endColumn, 6);

    assert.strictEqual(results[0].messages[3].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[3].message, 'unexpected whitespace after delimiter');
    assert.strictEqual(results[0].messages[3].line, 3);
    assert.strictEqual(results[0].messages[3].column, 7);
    assert.strictEqual(results[0].messages[3].endLine, 3);
    assert.strictEqual(results[0].messages[3].endColumn, 9);

    assert.strictEqual(results[0].messages[4].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[4].message, 'unexpected whitespace before delimiter');
    assert.strictEqual(results[0].messages[4].line, 4);
    assert.strictEqual(results[0].messages[4].column, 5);
    assert.strictEqual(results[0].messages[4].endLine, 4);
    assert.strictEqual(results[0].messages[4].endColumn, 6);

    assert.strictEqual(results[0].messages[5].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[5].message, 'unexpected whitespace after delimiter');
    assert.strictEqual(results[0].messages[5].line, 4);
    assert.strictEqual(results[0].messages[5].column, 7);
    assert.strictEqual(results[0].messages[5].endLine, 4);
    assert.strictEqual(results[0].messages[5].endColumn, 9);

    assert.strictEqual(results[0].messages[6].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[6].message, 'unexpected whitespace before delimiter');
    assert.strictEqual(results[0].messages[6].line, 5);
    assert.strictEqual(results[0].messages[6].column, 5);
    assert.strictEqual(results[0].messages[6].endLine, 5);
    assert.strictEqual(results[0].messages[6].endColumn, 6);

    assert.strictEqual(results[0].messages[7].ruleId, 'ini/delim-whitespace');
    assert.strictEqual(results[0].messages[7].message, 'unexpected whitespace after delimiter');
    assert.strictEqual(results[0].messages[7].line, 6);
    assert.strictEqual(results[0].messages[7].column, 6);
    assert.strictEqual(results[0].messages[7].endLine, 6);
    assert.strictEqual(results[0].messages[7].endColumn, 7);
  });

  test('fixes no delim whitespace', async () => {
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
          'ini/delim-whitespace': ['error', 'none']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/delim-spaces.ini');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'foo=bar\nbaz=boz\nfoz=faz\nlolz=zozl\nfood=bard\nbood=fard\n');
  });

  test('fixes single-space delim whitespace', async () => {
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
          'ini/delim-whitespace': ['error', 'single-space']
        }
      }
    });
    const results = await eslint.lintFiles('fixtures/delim-spaces.ini');
    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].messages.length, 0);
    assert.strictEqual(results[0].output, 'foo = bar\nbaz = boz\nfoz = faz\nlolz = zozl\nfood = bard\nbood = fard\n');
  });
});
