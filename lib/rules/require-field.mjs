const config = {
  meta: {
    type: 'problem',
    messages: {
      missingField: '`{{name}}` is a required field'
    },
    schema: {
      type: 'array',
      minItems: 1,
      maxItems: 1,
      prefixItems: [
        { enum: ['error', 'warn'] },
        {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      ]
    }
  },
  create: (context) => {
    const requiredFields = context.options[0];
    const seenFields = [];

    return {
      'Document:exit': (node) => {
        for (const r of requiredFields) {
          const seen = seenFields.find((s) => {
            return s === r;
          });
          if (!seen) {
            context.report({
              messageId: 'missingField',
              node,
              data: {
                name: r
              }
            });
          }
        }
      },
      Key: (node) => {
        let k = '';
        let n = node;

        while (n) {
          if (n.type === 'Section') {
            break;
          }
          if (n.type === 'CompositeKey') {
            n = n.parent;
            continue;
          }
          if (n.type === 'Line') {
            if (!n.section) {
              break;
            }
            n = n.section.keys[n.section.keys.length - 1];
          }
          k = n.content + (k ? '.' + k : '');
          n = n.parent;
        }
        seenFields.push(k);
      }
    };
  }
};

export default config;
