import { TextSourceCodeBase, VisitNodeStep } from '@eslint/plugin-kit';
import { parse } from './parser/index.mjs';

export default class INIParser {
  /**
   * The type of file to read.
   * @type {"text"}
   */
  fileType = 'text';

  /**
   * The line number at which the parser starts counting.
   * @type {0|1}
   */
  lineStart = 0;

  /**
   * The column number at which the parser starts counting.
   * @type {0|1}
   */
  columnStart = 0;

  /**
   * The name of the key that holds the type of the node.
   * @type {string}
   */
  nodeTypeKey = 'type';

  /**
   * Visitor keys
   * @type {object}
   */
  visitorKeys = {
    Document: [],
    Line: [],
    Section: [],
    Key: [],
    CompositeKey: [],
    Delimiter: [],
    Value: [],
    Comment: [],
    Whitespace: []
  };

  /**
   * Validates the language options.
   * @param {LanguageOptions} languageOptions The language options to validate.
   * @returns {void}
   * @throws {Error} When the language options are invalid.
   */
  validateLanguageOptions (languageOptions) {
    // TODO: probably need these for --fix?
  }

  /**
   * Parses the given file into an AST.
   * @param {File} file The virtual file to parse.
   * @param {{languageOptions: LanguageOptions}} context The options to use for parsing.
   * @returns {ParseResult} The result of parsing.
   */
  parse (file) {
    try {
      const doc = parse(file.body);
      // TODO: these are soft errors,
      // They could be reported as line errors
      // because the rest of the doc can process.
      // Maybe we could not report them here?
      if (doc.errors.length) {
        return {
          ok: false,
          errors: doc.errors
        };
      }
      return {
        ok: true,
        ast: doc
      };
    } catch (e) {
      return {
        ok: false,
        errors: [e]
      };
    }
  }

  /**
   * Creates a new `INISourceCode` object from the given information.
   * @param {File} file The virtual file to create a `INISourceCode` object from.
   * @param {ParseResult} parseResult The result returned from `parse()`.
   * @returns {INISourceCode} The new `INISourceCode` object.
   */
  createSourceCode (file, parseResult) {
    return new INISourceCode({
      text: file.body,
      ast: parseResult.ast
    });
  }
}

class INISourceCode extends TextSourceCodeBase {
  /**
   * Creates a new instance.
   * @param {Object} options The options for the instance.
   * @param {string} options.text The source code text.
   * @param {DocumentNode} options.ast The root AST node.
   */
  constructor ({ text, ast }) {
    super({ text, ast });
  }

  getRange (token) {
    return token.range;
  }

  /**
   * Traverse the source code and return the steps that were taken.
   * @returns {Iterable<INITraversalStep>} The steps that were taken while traversing the source code.
   */
  traverse () {
    const steps = [];

    steps.push(new INITraversalStep({
      target: this.ast,
      args: [this.ast],
      phase: 1
    }));

    for (const line of this.ast.lines) {
      steps.push(new INITraversalStep({
        target: line,
        args: [line],
        phase: 1
      }));

      for (const token of line.tokens) {
        steps.push(new INITraversalStep({
          target: token,
          args: [token],
          phase: 1
        }));

        if (token.type === 'CompositeKey' || token.type === 'Section') {
          for (const key of token.keys) {
            steps.push(new INITraversalStep({
              target: key,
              args: [key],
              phase: 1
            }));
          }
        }

        steps.push(new INITraversalStep({
          target: token,
          args: [token],
          phase: 2
        }));
      }

      steps.push(new INITraversalStep({
        target: line,
        args: [line],
        phase: 2
      }));
    }

    steps.push(new INITraversalStep({
      target: this.ast,
      args: [this.ast],
      phase: 2
    }));

    return steps;
  }
}

class INITraversalStep extends VisitNodeStep {
  /**
   * Creates a new instance.
   * @param {Object} options The options for the step.
   * @param {Node} options.target The target of the step.
   * @param {1|2} options.phase The phase of the step.
   * @param {Array<any>} options.args The arguments of the step.
   */
  constructor ({ target, phase, args }) {
    super({ target, phase, args });
  }
}
