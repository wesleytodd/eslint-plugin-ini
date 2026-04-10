const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      noAuth: 'remove auth tokens',
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
        if (node.parent.type !== 'Line' || node.parent.section) {
          return;
        }
        // TODO: ini does not treat `.` in keys the same way this is
        // so I think the parser needs to be updated to accomidate for this
        debugger;

        // _auth=asfasdfdsfsdf
        // _authToken=asfasdfdsfsdf
        // //registry.npmjs.com/:_auth="asdfasdasdfdasdf="
        // //registry.npmjs.com/:_authToken="asdfasdasdfdasdf="
        const match = node.content.match(/(.*:)?_auth(Token)?/i);
        if (match) {
          context.report({
            messageId: 'noAuth',
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
