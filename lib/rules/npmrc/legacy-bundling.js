const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      noLegacyBundling: 'legacy-bundling is deprecated and should be removed',
    },
    schema: []
  },
  create: (context) => {
    return {
      Key: (node) => {
        if (node.parent.type !== 'Line' || node.parent.section || node.content !== 'legacy-bundling') {
          return;
        }

        context.report({
          messageId: 'noLegacyBundling',
          node: node.parent,
          fix: function (fixer) {
            return fixer.remove(node.parent);
          }
        });
      }
    };
  }
};

export default config;
