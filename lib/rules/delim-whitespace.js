const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      unexpectedDelimWhitespace: 'unexpected whitespace {{placement}} delimiter'
    },
    schema: {
      type: 'array',
      prefixItems: [
        { enum: ['error', 'warn'] },
        { enum: ['none', 'single-space'] }
      ]
    }
  },
  create: (context) => {
    const shouldHaveWhitespace = context.options[0] === 'none' ? false : ' ';
    return {
      Line: (node) => {
        let prev;
        let delim;
        let next;
        for (const token of node.tokens) {
          if (delim) {
            next = token;
            break;
          }
          if (token.type === 'Delimiter') {
            delim = token;
            continue;
          }
          prev = token;
        }

        if (!delim) {
          return;
        }

        if (!shouldHaveWhitespace) {
          if (prev.type === 'Whitespace') {
            context.report({
              messageId: 'unexpectedDelimWhitespace',
              node: prev,
              data: {
                placement: 'before'
              },
              fix: (fixer) => {
                return fixer.remove(prev);
              }
            });
          }
          if (next.type === 'Whitespace') {
            context.report({
              messageId: 'unexpectedDelimWhitespace',
              node: next,
              data: {
                placement: 'after'
              },
              fix: (fixer) => {
                return fixer.remove(next);
              }
            });
          }
        } else {
          if (prev.type === 'Whitespace' && prev.content !== shouldHaveWhitespace) {
            context.report({
              messageId: 'unexpectedDelimWhitespace',
              node: prev,
              data: {
                placement: 'before'
              },
              fix: (fixer) => {
                return fixer.replaceText(prev, shouldHaveWhitespace);
              }
            });
          } else if (prev.type !== 'Whitespace') {
            context.report({
              messageId: 'unexpectedDelimWhitespace',
              node: delim,
              data: {
                placement: 'before'
              },
              fix: (fixer) => {
                return fixer.insertTextBefore(delim, shouldHaveWhitespace);
              }
            });
          }

          if (next.type === 'Whitespace' && next.content !== shouldHaveWhitespace) {
            context.report({
              messageId: 'unexpectedDelimWhitespace',
              node: next,
              data: {
                placement: 'after'
              },
              fix: (fixer) => {
                return fixer.replaceText(next, shouldHaveWhitespace);
              }
            });
          } else if (next.type !== 'Whitespace') {
            context.report({
              messageId: 'unexpectedDelimWhitespace',
              node: delim,
              data: {
                placement: 'after'
              },
              fix: (fixer) => {
                return fixer.insertTextAfter(delim, shouldHaveWhitespace);
              }
            });
          }
        }
      }
    };
  }
};

export default config;
