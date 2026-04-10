const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      noEmail: 'email is deprecated and should be removed',
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
        if (node.parent.type !== 'Line' || node.parent.section || node.content !== 'email') {
          return;
        }
        context.report({
          messageId: 'noEmail',
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
