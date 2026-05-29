const config = {
  meta: {
    type: 'problem',
    fixable: 'code',
    messages: {
      noPackageLock: 'package-lock should be removed',
      packageLock: 'package-lock should be {{shouldBe}}'
    },
    schema: [
      {
        enum: ['absent', 'true', 'false']
      }
    ]
  },
  create: (context) => {
    const shouldBe = context.options[0] || 'absent';
    let line = null;

    return {
      Key: (node) => {
        if (node.parent.type !== 'Line' || node.parent.section || node.content !== 'package-lock') {
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
            messageId: 'noPackageLock',
            node: line,
            fix: function (fixer) {
              return fixer.remove(line);
            }
          });
        } else if (node.content !== shouldBe) {
          context.report({
            messageId: 'packageLock',
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
