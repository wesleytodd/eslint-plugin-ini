const config = {
  meta: {
    type: 'problem',
    messages: {
      duplicateKey: 'No duplicate keys. {{key}} found {{times}} times'
    },
    schema: {
      type: 'array',
      prefixItems: [
        { enum: ['error', 'warn'] }
      ]
    }
  },
  create: (context) => {
    const seenFields = {};

    return {
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
        if (!seenFields[k]) {
          seenFields[k] = node;
        } else if (!Array.isArray(seenFields[k])) {
          seenFields[k] = [seenFields[k], node];
        } else {
          seenFields[k].push(seenFields[k]);
        }
      },
      'Document:exit': (node) => {
        for (const [key, val] of Object.entries(seenFields)) {
          if (Array.isArray(val)) {
            for (const k of val) {
              context.report({
                messageId: 'duplicateKey',
                data: {
                  key,
                  times: val.length
                },
                node: k
              });
            }
          }
        }
      }
    };
  }
};

export default config;
