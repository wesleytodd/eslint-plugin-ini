import { suite, test } from 'mocha';
import assert from 'node:assert';
import { parse } from '../lib/parser/index.mjs';

const COMMENTS = [';', '#'];
const WHITESPACE = [' ', '\t'];
const QUOTES = ['\'', '"'];

function whitespaceDisplay (str) {
  return str
    .replaceAll(' ', '\u00B7')
    .replaceAll('\t', '\\t');
}

suite('ini parser', () => {
  suite('comments ;/#', () => {
    const combos = COMMENTS.flatMap((commentChar) => {
      return WHITESPACE.flatMap((whitespaceChar) => {
        return [
          [commentChar, `${commentChar}comments`, ['Comment']],
          [commentChar, `${commentChar}${commentChar}comments`, ['Comment']],
          [commentChar, `${whitespaceChar}${commentChar}comments`, ['Whitespace', 'Comment']],
          [commentChar, `${commentChar}${whitespaceChar}comments`, ['Comment']],
          [commentChar, `${whitespaceChar}${commentChar}${whitespaceChar}comments`, ['Whitespace', 'Comment']],
          [commentChar, `${whitespaceChar}${whitespaceChar}${commentChar}${whitespaceChar}${whitespaceChar}comments`, ['Whitespace', 'Comment']]
        ];
      });
    });

    combos.forEach(([commentChar, str, tokenTypes]) => {
      test(str, () => {
        const doc = parse(str);
        assert.strictEqual(doc.type, 'Document');
        assert.strictEqual(doc.lines.length, 1);
        assert.strictEqual(doc.errors.length, 0);
        assert.strictEqual(doc.content, str);
        assert.deepStrictEqual(doc.start, {
          line: 0,
          column: 0
        });
        assert.deepStrictEqual(doc.end, {
          line: 0,
          column: str.length
        });

        const line = doc.lines[0];
        assert.strictEqual(line.type, 'Line');
        assert.strictEqual(line.content, str);
        assert.deepStrictEqual(line.start, {
          line: 0,
          column: 0
        });
        assert.deepStrictEqual(line.end, {
          line: 0,
          column: str.length
        });

        assert.strictEqual(line.tokens.length, tokenTypes.length);
        for (let i = 0; i < tokenTypes.length; i++) {
          assert.strictEqual(line.tokens[i].type, tokenTypes[i]);
          if (line.tokens[i].type === 'Comment') {
            assert.strictEqual(line.tokens[i].content[0], commentChar);
          }
        }
      });
    });
  });

  suite('empty lines, spaces, and tabs', () => {
    const combos = [[null, '', []]]
      .concat(WHITESPACE.flatMap((whitespaceChar) => {
        return [
          [whitespaceChar, `${whitespaceChar}`, ['Whitespace']],
          [whitespaceChar, `${whitespaceChar}${whitespaceChar}`, ['Whitespace']]
        ];
      }));

    combos.forEach(([whitespaceChar, str, tokenTypes]) => {
      test(whitespaceChar ? whitespaceDisplay(str) : 'empty line', () => {
        const doc = parse(str);
        assert.strictEqual(doc.type, 'Document');
        assert.strictEqual(doc.lines.length, 1);
        assert.strictEqual(doc.errors.length, 0);
        assert.strictEqual(doc.content, str);
        assert.deepStrictEqual(doc.start, {
          line: 0,
          column: 0
        });
        assert.deepStrictEqual(doc.end, {
          line: 0,
          column: str.length
        });

        const line = doc.lines[0];
        assert.strictEqual(line.type, 'Line');
        assert.strictEqual(line.content, str);
        assert.deepStrictEqual(line.start, {
          line: 0,
          column: 0
        });
        assert.deepStrictEqual(line.end, {
          line: 0,
          column: str.length
        });

        assert.strictEqual(line.tokens.length, tokenTypes.length);
        for (let i = 0; i < tokenTypes.length; i++) {
          assert.strictEqual(line.tokens[i].type, tokenTypes[i]);
          if (line.tokens[i].type === 'Whitespace') {
            assert.strictEqual(line.tokens[i].content[0], whitespaceChar);
          }
        }
      });
    });
  });

  suite('key=val', () => {
    const combos = [[null, 'a=b', ['Key', 'Delimiter', 'Value']]]
      .concat(WHITESPACE.flatMap((whitespaceChar) => {
        return [
          [whitespaceChar, `${whitespaceChar}a=b`, ['Whitespace', 'Key', 'Delimiter', 'Value']],
          [whitespaceChar, `a${whitespaceChar}=b`, ['Key', 'Whitespace', 'Delimiter', 'Value']],
          [whitespaceChar, `a=${whitespaceChar}b`, ['Key', 'Delimiter', 'Whitespace', 'Value']],
          [whitespaceChar, `a=b${whitespaceChar}`, ['Key', 'Delimiter', 'Value', 'Whitespace']]
        ];
      }));

    combos.forEach(([whitespaceChar, str, tokenTypes]) => {
      test(whitespaceDisplay(str), () => {
        const doc = parse(str);
        assert.strictEqual(doc.type, 'Document');
        assert.strictEqual(doc.lines.length, 1);
        assert.strictEqual(doc.errors.length, 0);
        assert.strictEqual(doc.content, str);
        assert.deepStrictEqual(doc.start, {
          line: 0,
          column: 0
        });
        assert.deepStrictEqual(doc.end, {
          line: 0,
          column: str.length
        });

        const line = doc.lines[0];
        assert.strictEqual(line.type, 'Line');
        assert.strictEqual(line.content, str);
        assert.deepStrictEqual(line.start, {
          line: 0,
          column: 0
        });
        assert.deepStrictEqual(line.end, {
          line: 0,
          column: str.length
        });

        assert.strictEqual(line.tokens.length, tokenTypes.length);
        for (let i = 0; i < tokenTypes.length; i++) {
          assert.strictEqual(line.tokens[i].type, tokenTypes[i]);

          switch (line.tokens[i].type) {
            case 'Whitespace':
              assert.strictEqual(line.tokens[i].content[0], whitespaceChar);
              break;
            case 'Key':
              assert.strictEqual(line.tokens[i].content, 'a');
              break;
            case 'Value':
              assert.strictEqual(line.tokens[i].content, 'b');
              break;
          }
        }
      });
    });

    test('spaces in keys and values', () => {
      const str = `
        key with spaces=hey you never know
        key needs trim  =  val needs trim   
      `;
      const doc = parse(str);
      assert.strictEqual(doc.type, 'Document');
      assert.strictEqual(doc.lines.length, 4);
      assert.strictEqual(doc.errors.length, 0);

      assert.strictEqual(doc.lines[1].type, 'Line');
      assert.deepStrictEqual(doc.lines[1].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[1].tokens[1].content, 'key with spaces');
      assert.strictEqual(doc.lines[1].tokens[3].content, 'hey you never know');

      assert.strictEqual(doc.lines[2].type, 'Line');
      assert.deepStrictEqual(doc.lines[2].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Whitespace', 'Delimiter', 'Whitespace', 'Value', 'Whitespace']);
      assert.strictEqual(doc.lines[2].tokens[1].content, 'key needs trim');
      assert.strictEqual(doc.lines[2].tokens[5].content, 'val needs trim');
    });

    test('compositeKeys: false (default))', () => {
      const str = `
        a0.b0.c0=val
        "a1.b1.c1"=val
        a2\\.b2\\.c2=val
        "a3\\.b3\\.c3"=val
      `;

      const doc = parse(str);
      assert.strictEqual(doc.type, 'Document');
      assert.strictEqual(doc.lines.length, 6);
      assert.strictEqual(doc.errors.length, 0);

      assert.deepStrictEqual(doc.lines[1].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[1].tokens[1].content, 'a0.b0.c0');
      assert.strictEqual(doc.lines[1].tokens[1].keys, undefined);
      assert.strictEqual(doc.lines[1].tokens[3].content, 'val');

      assert.deepStrictEqual(doc.lines[2].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[2].tokens[1].content, 'a1.b1.c1');
      assert.strictEqual(doc.lines[2].tokens[1].keys, undefined);
      assert.strictEqual(doc.lines[2].tokens[3].content, 'val');

      assert.deepStrictEqual(doc.lines[3].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[3].tokens[1].content, 'a2\\.b2\\.c2');
      assert.strictEqual(doc.lines[3].tokens[1].keys, undefined);
      assert.strictEqual(doc.lines[3].tokens[3].content, 'val');

      assert.deepStrictEqual(doc.lines[4].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[4].tokens[1].content, 'a3\\.b3\\.c3');
      assert.strictEqual(doc.lines[4].tokens[1].keys, undefined);
      assert.strictEqual(doc.lines[4].tokens[3].content, 'val');
    });

    test('compositeKeys: true', () => {
      const str = `
        a0.b0.c0=val
        "a1.b1.c1"=val
        a2\\.b2\\.c2=val
        "a3\\.b3\\.c3"=val
      `;

      const doc = parse(str, {
        compositeKeys: true
      });
      assert.strictEqual(doc.type, 'Document');
      assert.strictEqual(doc.lines.length, 6);
      assert.strictEqual(doc.errors.length, 0);

      assert.deepStrictEqual(doc.lines[1].tokens.map((t) => t.type), ['Whitespace', 'CompositeKey', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[1].tokens[1].content, 'a0.b0.c0');
      assert.strictEqual(doc.lines[1].tokens[3].content, 'val');

      const compKey = doc.lines[1].tokens[1];
      assert.deepStrictEqual(compKey.keys.map((t) => t.content), ['a0', 'b0', 'c0']);

      assert.strictEqual(compKey.keys[0].start.column, 8);
      assert.strictEqual(compKey.keys[0].end.column, 10);

      assert.strictEqual(compKey.keys[1].start.column, 11);
      assert.strictEqual(compKey.keys[1].end.column, 13);

      assert.strictEqual(compKey.keys[2].start.column, 14);
      assert.strictEqual(compKey.keys[2].end.column, 16);

      assert.deepStrictEqual(doc.lines[3].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[3].tokens[1].content, 'a2\\.b2\\.c2');
      assert.strictEqual(doc.lines[3].tokens[3].content, 'val');

      assert.deepStrictEqual(doc.lines[4].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[4].tokens[1].content, 'a3\\.b3\\.c3');
      assert.strictEqual(doc.lines[4].tokens[3].content, 'val');
    });
  });

  suite('"key"="val"', () => {
    const combos = QUOTES.flatMap((q) => {
      return WHITESPACE.flatMap((w) => {
        return [
          [q, w, `${q}a${q}=${q}b${q}`, ['Key', 'Delimiter', 'Value']],
          [q, w, `${w}${q}a${q}${w}=${w}${q}b${q}${w}`, ['Whitespace', 'Key', 'Whitespace', 'Delimiter', 'Whitespace', 'Value', 'Whitespace']]
        ];
      });
    });

    combos.forEach(([quoteChar, whitespaceChar, str, tokenTypes]) => {
      test(whitespaceDisplay(str), () => {
        const doc = parse(str);
        assert.strictEqual(doc.type, 'Document');
        assert.strictEqual(doc.lines.length, 1);
        assert.strictEqual(doc.errors.length, 0);
        assert.strictEqual(doc.content, str);
        assert.deepStrictEqual(doc.start, {
          line: 0,
          column: 0
        });
        assert.deepStrictEqual(doc.end, {
          line: 0,
          column: str.length
        });

        const line = doc.lines[0];
        assert.strictEqual(line.type, 'Line');
        assert.strictEqual(line.content, str);
        assert.deepStrictEqual(line.start, {
          line: 0,
          column: 0
        });
        assert.deepStrictEqual(line.end, {
          line: 0,
          column: str.length
        });

        assert.strictEqual(line.tokens.length, tokenTypes.length);
        for (let i = 0; i < tokenTypes.length; i++) {
          assert.strictEqual(line.tokens[i].type, tokenTypes[i]);

          switch (line.tokens[i].type) {
            case 'Whitespace':
              assert.strictEqual(line.tokens[i].content[0], whitespaceChar);
              break;
            case 'Key':
              assert.strictEqual(line.tokens[i].content, 'a');
              assert.strictEqual(line.tokens[i].quoteType, quoteChar);
              break;
            case 'Value':
              assert.strictEqual(line.tokens[i].content, 'b');
              assert.strictEqual(line.tokens[i].quoteType, quoteChar);
              break;
          }
        }
      });
    });

    test('quoted key not a section', () => {
      const str = '"[key]"=val';
      const doc = parse(str);
      assert.strictEqual(doc.type, 'Document');
      assert.strictEqual(doc.lines.length, 1);
      assert.strictEqual(doc.errors.length, 0);

      assert.strictEqual(doc.lines[0].type, 'Line');
      assert.deepStrictEqual(doc.lines[0].tokens.map((t) => t.type), ['Key', 'Delimiter', 'Value']);
      assert.strictEqual(doc.lines[0].tokens[0].content, '[key]');
      assert.strictEqual(doc.lines[0].tokens[2].content, 'val');
    });
  });

  suite('[section]', () => {
    test('empty', () => {
      const str = '[section]';
      const doc = parse(str);
      assert.strictEqual(doc.type, 'Document');
      assert.strictEqual(doc.lines.length, 1);
      assert.strictEqual(doc.errors.length, 0);
      assert.strictEqual(doc.content, str);
      assert.deepStrictEqual(doc.start, {
        line: 0,
        column: 0
      });
      assert.deepStrictEqual(doc.end, {
        line: 0,
        column: str.length
      });

      const line = doc.lines[0];
      assert.strictEqual(line.type, 'Line');
      assert.strictEqual(line.content, str);
      assert.deepStrictEqual(line.start, {
        line: 0,
        column: 0
      });
      assert.deepStrictEqual(line.end, {
        line: 0,
        column: str.length
      });

      assert.strictEqual(line.tokens.length, 1);
      assert.strictEqual(line.tokens[0].content, 'section');
    });

    test('with entries until empty line', () => {
      const str = `
        [section]
        a=b
        "c"="d"
        # section comment
        'e'=f

        not=section
      `;
      const doc = parse(str);
      assert.strictEqual(doc.type, 'Document');
      assert.strictEqual(doc.lines.length, 9);
      assert.strictEqual(doc.errors.length, 0);

      assert.strictEqual(doc.lines[1].type, 'Line');
      assert.deepStrictEqual(doc.lines[1].tokens.map((t) => t.type), ['Whitespace', 'Section']);
      assert.strictEqual(doc.lines[1].tokens[1].content, 'section');
      assert.deepStrictEqual(doc.lines[1].start, {
        line: 1,
        column: 0
      });
      assert.deepStrictEqual(doc.lines[1].end, {
        line: 1,
        column: 17
      });

      assert.deepStrictEqual(doc.lines[2].tokens.map((t) => t.type), ['Whitespace', 'Key', 'Delimiter', 'Value']);
      assert(doc.lines[2].section);
      assert.strictEqual(doc.lines[2].section.content, 'section');
      assert.strictEqual(doc.lines[3].section.content, 'section');
      assert.strictEqual(doc.lines[4].section.content, 'section');
      assert.strictEqual(doc.lines[5].section.content, 'section');
      assert.strictEqual(doc.lines[6].section.content, 'section');
      assert.strictEqual(doc.lines[7].section, null);
    });

    test('complex key', () => {
      const str = `
        [a.b.c]
        d=e
      `;
      const doc = parse(str);
      assert.strictEqual(doc.type, 'Document');
      assert.strictEqual(doc.lines.length, 4);
      assert.strictEqual(doc.errors.length, 0);

      assert.strictEqual(doc.lines[1].type, 'Line');
      assert.deepStrictEqual(doc.lines[1].tokens.map((t) => t.type), ['Whitespace', 'Section']);
      assert.strictEqual(doc.lines[1].tokens[1].content, 'a.b.c');
      assert.deepStrictEqual(doc.lines[1].tokens[1].keys.map((k) => k.content), ['a', 'b', 'c']);

      assert.strictEqual(doc.lines[2].section.content, 'a.b.c');
    });
  });

  suite('errors', () => {
    test('unterminated key', () => {
      const str = `
        key
        key # comment
        key ; comment
        key ; com = ment
        key \\; not comment
        "key"
        'key
        key    
      `;
      const doc = parse(str);
      assert.strictEqual(doc.type, 'Document');
      assert.strictEqual(doc.lines.length, 10);
      assert.strictEqual(doc.errors.length, 8);

      assert.strictEqual(doc.errors[0].start.line, 1);
      assert.strictEqual(doc.errors[0].start.column, 8);
      assert.strictEqual(doc.errors[0].end.column, 11);

      assert(doc.errors[1].message.includes('#'));
      assert.strictEqual(doc.errors[1].start.line, 2);
      assert.strictEqual(doc.errors[1].start.column, 8);
      assert.strictEqual(doc.errors[1].end.column, 12);

      assert(doc.errors[2].message.includes(';'));
      assert.strictEqual(doc.errors[2].start.line, 3);
      assert.strictEqual(doc.errors[2].start.column, 8);
      assert.strictEqual(doc.errors[2].end.column, 12);

      assert(doc.errors[3].message.includes(';'));
      assert.strictEqual(doc.errors[3].start.line, 4);
      assert.strictEqual(doc.errors[3].start.column, 8);
      assert.strictEqual(doc.errors[3].end.column, 12);

      assert(doc.errors[4].message.includes('end of line'));
      assert.strictEqual(doc.errors[4].start.line, 5);
      assert.strictEqual(doc.errors[4].start.column, 8);
      assert.strictEqual(doc.errors[4].end.column, 26);

      assert(doc.errors[5].message.includes('end of line'));
      assert.strictEqual(doc.errors[5].start.line, 6);
      assert.strictEqual(doc.errors[5].start.column, 13);
      assert.strictEqual(doc.errors[5].end.column, 13);

      assert(doc.errors[6].message.includes('\''));
      assert.strictEqual(doc.errors[6].start.line, 7);
      assert.strictEqual(doc.errors[6].start.column, 8);
      assert.strictEqual(doc.errors[6].end.column, 12);

      assert(doc.errors[7].message.includes('end of line'));
      assert.strictEqual(doc.errors[7].start.line, 8);
      assert.strictEqual(doc.errors[7].start.column, 8);
      assert.strictEqual(doc.errors[7].end.column, 15);
    });
  });
});
