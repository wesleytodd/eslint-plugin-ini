const config = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      duplicateKey: 'No duplicate keys. {{key}} found {{times}} times'
    },
    schema: []
  },
  create: (context) => {
    const seenKeys = {};
    const seenValues = new Map();
    let lastKey = null;

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
        if (!seenKeys[k]) {
          seenKeys[k] = node;
        } else if (!Array.isArray(seenKeys[k])) {
          seenKeys[k] = [seenKeys[k], node];
        } else {
          seenKeys[k].push(node);
        }
        lastKey = node;
      },

      Value: (node) => {
        if (lastKey) {
          seenValues.set(lastKey, node);
          lastKey = null;
        }
      },

      'Document:exit': (node) => {
        for (const [key, val] of Object.entries(seenKeys)) {
          if (!Array.isArray(val)) {
            continue;
          }

          const reports = [];
          let v;
          for (const k of val) {
            if (v) {
              const newVal = seenValues.get(k);
              if (v.content === newVal.content) {
                reports.push({
                  messageId: 'duplicateKey',
                  data: {
                    key,
                    times: val.length
                  },
                  node: k,
                  fix: (fixer) => {
                    return fixer.remove(k.parent);
                  }
                });
              } else {
                v = newVal;
                reports.push({
                  messageId: 'duplicateKey',
                  data: {
                    key,
                    times: val.length
                  },
                  node: k
                });
              }
            } else {
              v = seenValues.get(k);
              reports.push({
                messageId: 'duplicateKey',
                data: {
                  key,
                  times: val.length
                },
                node: k
              });
            }
          }

          for (const r of reports) {
            context.report(r);
          }
        }
      }
    };
  }
};

export default config;
