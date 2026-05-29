const config = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      noAlwaysAuth: 'always-auth is deprecated and should be removed'
    },
    schema: []
  },
  create: (context) => {
    return {
      Key: (node) => {
        if (node.parent.type !== 'Line' || node.parent.section) {
          return;
        }

        // always-auth=true
        // //registry.npmjs.com/:always-auth=true
        if (node.content.match(/^(.*:)?always-auth/i)) {
          context.report({
            messageId: 'noAlwaysAuth',
            node: node.parent,
            fix: (fixer) => {
              return fixer.remove(node.parent);
            }
          });
        }
      }
    };
  }
};

export default config;
