const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      trailingWhitespace: 'no trailing whitespace'
    },
    schema: []
  },
  create: (context) => {
    return {
      Line: (node) => {
        const last = node.tokens[node.tokens.length - 1];
        if (!last || last.type !== 'Whitespace') {
          return;
        }
        context.report({
          messageId: 'trailingWhitespace',
          node: last,
          fix: (fixer) => {
            return fixer.remove(last);
          }
        });
      }
    };
  }
};

export default config;
