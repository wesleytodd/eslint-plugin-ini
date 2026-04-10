const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      noAlwaysAuth: 'always-auth is deprecated and should be removed',
    },
    schema: {
      type: 'array',
      prefixItems: [
        { enum: ['error', 'warn'] }
      ]
    }
  },
  create: (context) => {
    return {
      Key: (node) => {
        if (node.parent.type !== 'Line' || node.parent.section || node.content !== 'always-auth') {
          return;
        }
        context.report({
          messageId: 'noAlwaysAuth',
          node: node.parent,
          fix: (fixer) => {
            return fixer.remove(node.parent);
          }
        });
      }
    };
  }
};

export default config;
