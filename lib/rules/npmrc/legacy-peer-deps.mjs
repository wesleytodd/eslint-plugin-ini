const config = {
  meta: {
    type: 'problem',
    fixable: true,
    messages: {
      noLegacyPeerDeps: 'legacy-peer-deps should not be set',
      missingLegacyPeerDeps: 'legacy-peer-deps missing, should be set to {{shouldBe}}',
      unknownLegacyPeerDepsSetting: 'legacy-peer-deps is a boolean value. Saw {{setting}} but expected {{shouldBe}}',
      wrongLegacyPeerDeps: 'legacy-peer-deps should be set to {{shouldBe}}, saw {{setting}}'
    },
    schema: {
      type: 'array',
      prefixItems: [
        { enum: ['error', 'warn'] },
        {
          enum: ['absent', 'true', 'false']
        }
      ]
    }
  },
  create: (context) => {
    const lpdShouldBe = context.options[0] || 'absent';
    let lpd;
    return {
      Key: (node) => {
        if (node.parent.type !== 'Line' || node.parent.section) {
          return;
        }
        if (node.content === 'legacy-peer-deps') {
          lpd = { key: node };
        }
      },
      Value: (node) => {
        if (!lpd) {
          return;
        }
        lpd.val = node;
      },
      'Document:exit': (doc) => {
        if (lpdShouldBe === 'absent') {
          if (lpd) {
            context.report({
              messageId: 'noLegacyPeerDeps',
              node: lpd.key.parent,
              fix: (fixer) => {
                return fixer.remove(lpd.key.parent);
              }
            });
          }
          return;
        }

        if (!lpd) {
          context.report({
            messageId: 'missingLegacyPeerDeps',
            node: doc,
            data: {
              shouldBe: lpdShouldBe
            },
            fix: (fixer) => {
              return fixer.insertTextAfter(doc, `legacy-peer-deps=${lpdShouldBe}`);
            }
          });
          return;
        }

        if (lpd.val.content !== 'true' && lpd.val.content !== 'false') {
          context.report({
            messageId: 'unknownLegacyPeerDepsSetting',
            data: {
              setting: lpd.val.content,
              shouldBe: lpdShouldBe
            },
            node: lpd.val,
            fix: (fixer) => {
              return fixer.replace(lpd.val, lpdShouldBe);
            }
          });
          return;
        }

        if (lpd.val.content !== lpdShouldBe) {
          context.report({
            messageId: 'wrongLegacyPeerDeps',
            data: {
              setting: lpd.val.content,
              shouldBe: lpdShouldBe
            },
            node: lpd.val,
            fix: (fixer) => {
              return fixer.replace(lpd.val, lpdShouldBe);
            }
          });
        }
      }
    };
  }
};

export default config;
