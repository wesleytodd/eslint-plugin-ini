const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      defaultRegistryRequired: 'default registry is required',
      scopedRegistryRequired: 'registry is required for scope {{scope}}',
      incorrectDefaultRegistry: 'registry is required to match {{registry}}',
      incorrectScopedRegistry: 'registry for {{scope}} is required for to match {{registry}}',
      unknownRegistry: 'unknown registry for {{scope}}'
    },
    schema: {
      type: 'array',
      prefixItems: [
        { enum: ['error', 'warn'] },
        {
          type: ['object', 'string']
        },
        { type: 'boolean' }
      ]
    }
  },
  create: (context) => {
    const requiredRegistries = typeof context.options[0] === 'string'
      ? {
          default: {
            url: context.options[0]
          }
        }
      : Object.entries(context.options[0]).reduce((obj, [k, v]) => {
        obj[k] = typeof v === 'string' ? { url: v } : v;
        return obj;
      }, {});

    const strict = !!context.options[1];

    const registries = {};

    let lastRegistryKey;
    return {
      Key: (node) => {
        if (node.parent.type !== 'Line' || node.parent.section) {
          return;
        }

        // TODO: fix this to be actually correct matching
        // https://docs.npmjs.com/cli/v9/using-npm/scope
        const match = node.content.match(/((@[a-z0-9-_]*):)?registry/i);
        if (match) {
          lastRegistryKey = {
            scope: match[2] ? match[2] : 'default',
            keyNode: node
          };
        }
      },
      Value: (node) => {
        if (lastRegistryKey) {
          lastRegistryKey.registry = node.content;
          lastRegistryKey.valNode = node;
          registries[lastRegistryKey.scope] = lastRegistryKey;
          lastRegistryKey = null;
        }
      },
      'Document:exit': (node) => {
        for (const [k, v] of Object.entries(requiredRegistries)) {
          // missing required registry
          if (!registries[k] && v.required !== false) {
            context.report({
              messageId: k === 'default' ? 'defaultRegistryRequired' : 'scopedRegistryRequired',
              node,
              data: {
                scope: k
              },
              fix: (fixer) => {
                if (k === 'default') {
                  return fixer.insertTextAfter(node, `\nregistry=${v.url}`);
                } else {
                  return fixer.insertTextAfter(node, `\n${k}:registry=${v.url}`);
                }
              }
            });
            continue;
          }

          // incorrect registry url value
          if (registries[k].registry !== v.url) {
            context.report({
              messageId: k === 'default' ? 'incorrectDefaultRegistry' : 'incorrectScopedRegistry',
              node: registries[k].valNode,
              data: {
                scope: k,
                registry: v.url
              },
              fix: (fixer) => {
                return fixer.replaceText(registries[k].valNode, v.url);
              }
            });
          }
        }

        // Check for disallowed registries
        if (strict) {
          for (const [k, v] of Object.entries(registries)) {
            if (!requiredRegistries[k]) {
              context.report({
                messageId: 'unknownRegistry',
                node: v.valNode.parent,
                data: {
                  scope: k
                },
                fix: (fixer) => {
                  return fixer.remove(v.valNode.parent);
                }
              });
            }
          }
        }
      }
    };
  }
};

export default config;
