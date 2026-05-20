const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      noAuth: 'remove auth tokens',
    },
    schema: []
  },
  create: (context) => {
    return {
      Key: (node) => {
        if (node.parent.type !== 'Line' || node.parent.section) {
          return;
        }

        // _auth=asfasdfdsfsdf
        // _authToken=asfasdfdsfsdf
        // _password=asfasdfdsfsdf
        // //registry.npmjs.com/:_auth="asdfasdasdfdasdf="
        // //registry.npmjs.com/:_authToken="asdfasdasdfdasdf="
        // //registry.npmjs.com/:_password="asdfasdasdfdasdf="
        if (node.content.match(/(.*:)?_(auth(Token)?|password)/i)) {
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
