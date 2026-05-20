const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      noLegacyPeerDeps: 'legacy-peer-deps should be removed',
      legacyPeerDeps: 'legacy-peer-deps should be {{shouldBe}}'
    },
    schema: [
      {
        enum: ['absent', 'true', 'false']
      }
    ]
  },
  create: (context) => {
    const shouldBe = context.options[0] || 'absent';
    let line;

    return {
      Key: (node) => {
        if (node.parent.type !== 'Line' || node.parent.section || node.content !== 'legacy-peer-deps') {
          return;
        }
        line = node.parent;
      },
      Value: (node) => {
        if (!line) {
          return;
        }

        if (shouldBe === 'absent') {
          context.report({
            messageId: 'noLegacyPeerDeps',
            node: node.parent,
            fix: (fixer) => {
              return fixer.remove(node.parent);
            }
          });
        } else if (node.content !== shouldBe) {
          context.report({
            messageId: 'legacyPeerDepsSetting',
            data: { shouldBe },
            node,
            fix: (fixer) => {
              return fixer.replaceText(node, shouldBe);
            }
          });
        }
        line = null;
      }
    };
  }
};

export default config;
