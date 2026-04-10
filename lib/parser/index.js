import { Document, Line, Comment, Whitespace, Key, Value, Delimiter, Section, CompositeKey } from './tokens.js';

export const DEFAULTS = {
  compositeKeys: false
};

export function parse (str, _opts) {
  const opts = {
    ...DEFAULTS,
    ..._opts
  };

  const doc = new Document(str);

  let lineNumber = -1;
  let lineRangeStart = 0;
  let currentSection = null;

  for (const lineStr of doc.rawLines) {
    lineNumber++;

    const line = new Line(lineNumber, lineStr);
    line.parent = doc;
    line.section = currentSection;
    line.range = [lineRangeStart, lineRangeStart + lineStr.length + 1];

    lineRangeStart = line.range[1];
    doc.lines.push(line);
    let state = lineStart(lineNumber, 0, lineStr);

    while (state) {
      let err;
      let token;
      let nextState;
      try {
        [err, token, nextState] = state(opts);
      } catch (e) {
        err = new Error('INI_INTERNAL_ERROR', { cause: e });
      }

      // collect error, keep parsing at next line
      if (err) {
        doc.errors.push(err);
        break;
      }

      // Keep line's tokens
      if (token) {
        const rangeStart = line.range[0] + token.start.column;
        token.range = [rangeStart, rangeStart + token.content.length];

        if (token instanceof Section) {
          currentSection = token;
        }

        token.parent = line;
        line.tokens.push(token);
      }

      state = nextState;
    }

    if (currentSection && (
      line.tokens.length === 0 ||
      !line.tokens.find((t) => !(t instanceof Whitespace))
    )) {
      currentSection = null;
    }
  }

  return doc;
}

function parseError (lineNum, startChar, endChar, lineStr, message, extras) {
  const err = new Error(message);
  Object.assign(err, {
    ...extras,
    code: 'INI_PARSE_ERROR',
    content: lineStr.slice(startChar, endChar),
    start: {
      line: lineNum,
      column: startChar
    },
    end: {
      line: lineNum,
      column: endChar
    }
  });
  return [err, null, null];
}

function lineStart (lineNum, charNum, lineStr) {
  return () => {
    const char = lineStr.charAt(charNum);
    switch (char) {
      // Empty Line
      case '':
      case '\n':
      case '\r':
        return [null, null, null];

      // White space
      case ' ':
      case '\t':
        return whitespace(lineNum, charNum, lineStr, lineStart)();

      // Comment
      case ';':
      case '#':
        return [null, null, comment(lineNum, charNum, lineStr)];

      // Section
      case '[':
        return [null, null, section(lineNum, charNum, lineStr)];

      // Key
      default:
        return [null, null, key(lineNum, charNum, lineStr)];
    }
  };
}

function comment (lineNum, charNum, lineStr) {
  return () => {
    const char = lineStr.charAt(charNum);
    if (char !== ';' && char !== '#') {
      return [new Error(`unexpected ${char}, expected comment (; or #)`)];
    }

    return [null, new Comment(lineNum, charNum, lineStr.slice(charNum)), null];
  };
}

function whitespace (lineNum, charNum, lineStr, returnTo) {
  return () => {
    let whitespace = '';
    let cur = charNum;
    let char = lineStr.charAt(cur);

    while (char === ' ' || char === '\t') {
      whitespace += char;
      char = lineStr.charAt(++cur);
    }

    return [
      null,
      whitespace ? new Whitespace(lineNum, charNum, whitespace) : null,
      returnTo !== null ? returnTo(lineNum, cur, lineStr) : null
    ];
  };
}

function section (lineNum, charNum, lineStr) {
  return () => {
    let accum = '';
    let sectionName = '';
    let cur = charNum;
    let char = lineStr.charAt(cur);
    const subkeys = [];

    if (char !== '[') {
      return parseError(lineNum, charNum, charNum, lineStr, `unexpected ${char}, expected section start [`);
    }

    // Move past starting bracket
    char = lineStr.charAt(++cur);

    while (char) {
      switch (char) {
        case ']':
          ++cur;
          break;

        case '.':
          // Escaped .
          if (lineStr.charAt(cur - 1) === '\\') {
            accum += char;
          } else {
            subkeys.push(new Key(lineNum, cur - accum.length, accum));
            accum = '';
          }
          sectionName += char;
          break;

        default:
          accum += char;
          sectionName += char;
      }

      char = lineStr.charAt(++cur);
    }

    const section = new Section(lineNum, charNum, sectionName);
    subkeys.push(new Key(lineNum, cur - accum.length, accum));
    // Turn the keys also into a linked list so rules can easily
    // build full key paths
    let p;
    for (const k of subkeys) {
      p = p || section;
      k.parent = p;
      p = k;
    }
    section.keys = subkeys;

    return [
      null,
      section,
      whitespace(lineNum, cur, lineStr, null)
    ];
  };
}

function quoted (lineNum, charNum, lineStr, returnTo, Token) {
  return () => {
    let quotedText = '';
    let cur = charNum;
    let char = lineStr.charAt(cur);
    // Advance past the starting quote
    const quoteType = char;
    char = lineStr.charAt(++cur);

    while (char) {
      // Ending of quoted block
      if (
        quoteType === char &&
        (
          lineStr.charAt(cur - 1) !== '\\' ||
          (
            lineStr.charAt(cur - 1) === '\\' &&
            lineStr.charAt(cur - 2) !== '\\'
          )
        )
      ) {
        ++cur;
        break;
      }

      quotedText += char;
      char = lineStr.charAt(++cur);
    }

    if (lineStr.charAt(cur - 1) !== quoteType) {
      return parseError(lineNum, charNum, cur, lineStr, `unterminated quote block, expected trailing ${quoteType}`);
    }

    return [
      null,
      new Token(lineNum, charNum, quotedText, quoteType),
      returnTo(lineNum, cur, lineStr)
    ];
  };
}

function key (lineNum, charNum, lineStr) {
  return ({ compositeKeys }) => {
    let cur = charNum;
    let char = lineStr.charAt(cur);
    let accum = '';
    let subkeys;

    if (char === '"' || char === '\'') {
      return quoted(lineNum, charNum, lineStr, (ln, c, l) => {
        return whitespace(ln, c, l, delimiter);
      }, Key)();
    }

    // consume key
    while (char) {
      switch (char) {
        // quoted key
        case '\'':
        case '"':
          // An escaped quote
          if (accum && lineStr.charAt(cur - 1) === '\\') {
            accum += char;
          } else if (accum) {
            return [new Error(`unexpected quote ${char} in key`)];
          }
          break;

        case ' ':
        case '\t':
          // eslint-disable-next-line no-case-declarations
          const [err, token, next] = whitespace(lineNum, cur, lineStr, (l, c, s) => {
            // If we reached the delimiter, move on
            if (s.charAt(c) === '=') {
              return delimiter(l, c, s);
            }
            // Else continue accumulating the key
            return null;
          })();
          if (err) {
            return [err];
          }
          // Reached the delimiter with trailing whitespace
          if (next !== null) {
            return [err, new Key(lineNum, charNum, accum), () => {
              return [null, token, next];
            }];
          }
          accum += token.content;
          cur += token.content.length - 1;
          break;

        case ';':
        case '#':
          if (lineStr.charAt(cur - 1) !== '\\') {
            return parseError(lineNum, charNum, cur, lineStr, `unexpected comment ${char}, expected =`);
          }
          // Escaped comment char
          accum += char;
          break;

        case '.':
          if (!compositeKeys) {
            accum += char;
            break;
          }
          // Escaped .
          if (lineStr.charAt(cur - 1) === '\\') {
            accum += char;
          } else {
            if (!subkeys) {
              subkeys = [];
            }
            subkeys.push(new Key(lineNum, cur - accum.length, accum));
            accum = '';
          }
          break;

        case '=':
          if (subkeys) {
            subkeys.push(new Key(lineNum, cur - accum.length, accum));
            const compKey = new CompositeKey(lineNum, charNum, subkeys);
            // Turn the keys also into a linked list so rules can easily
            // build full key paths
            let p;
            for (const k of compKey.keys) {
              p = p || compKey;
              k.parent = p;
              p = k;
            }
            return [null, compKey, delimiter(lineNum, cur, lineStr)];
          }
          return [null, new Key(lineNum, charNum, accum), delimiter(lineNum, cur, lineStr)];

        default:
          accum += char;
      }

      char = lineStr.charAt(++cur);
    }

    return parseError(lineNum, charNum, cur, lineStr, 'unexpected end of line, expected =');
  };
}

function delimiter (lineNum, charNum, lineStr) {
  return () => {
    const char = lineStr.charAt(charNum);
    if (char !== '=') {
      return parseError(lineNum, charNum, charNum, lineStr, `unexpected ${char || 'end of line'}, expected =`);
    }

    let cur = charNum;
    switch (lineStr.charAt(++cur)) {
      case ' ':
      case '\t':
        return [null, new Delimiter(lineNum, charNum, '='), whitespace(lineNum, cur, lineStr, value)];
      default:
        return [null, new Delimiter(lineNum, charNum, '='), value(lineNum, cur, lineStr)];
    }
  };
}

function value (lineNum, charNum, lineStr) {
  return () => {
    let cur = charNum;
    let char = lineStr.charAt(cur);
    let accum = '';

    if (char === '"' || char === '\'') {
      return quoted(lineNum, charNum, lineStr, (ln, c, l) => {
        // TODO: need to handle comments after value
        return whitespace(ln, c, l, null);
      }, Value)();
    }

    // consume value
    while (char) {
      switch (char) {
        // quoted value
        case '\'':
        case '"':
          // An escaped quote
          if (accum && lineStr.charAt(cur - 1) === '\\') {
            accum += char;
          } else if (accum) {
            return [new Error(`unexpected quote ${char} in value`)];
          }
          break;

          // Comment
        case ';':
        case '#':
        // TODO:: need to handle escaped comments
          return [null, new Value(lineNum, charNum, accum), comment(lineNum, charNum, lineStr)];

        case ' ':
        case '\t':
          // eslint-disable-next-line no-case-declarations
          const [err, token, next] = whitespace(lineNum, cur, lineStr, (l, c, s) => {
          // We reached the end of the line or a comment
            const char = s.charAt(c);
            if (char === '' || char === ';' || char === '#') {
              return () => [null, null, null];
            }
            // Else continue accumulating the value
            return null;
          })();
          if (err) {
            return [err];
          }
          // Reached the end of the value with trailing whitespace
          if (next !== null) {
            return [err, new Value(lineNum, charNum, accum), () => {
              return [null, token, next];
            }];
          }
          accum += token.content;
          cur += token.content.length - 1;
          break;

        default:
          accum += char;
      }
      char = lineStr.charAt(++cur);
    }

    return [null, new Value(lineNum, charNum, accum), null];
  };
}
