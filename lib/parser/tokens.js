export class Token {
  type;
  parent;
  range;
  start = {
    line: -1,
    column: -1
  };

  end = {
    line: -1,
    column: -1
  };

  constructor (content, start = this.start, end = this.end) {
    this.type = this.constructor.name;
    this.content = content;
    this.start = start;
    this.end = end;
  }

  get loc () {
    return {
      start: this.start,
      end: this.end
    };
  }
}

export class Document extends Token {
  lines = [];
  rawLines = [];
  errors = [];

  constructor (str) {
    const lines = str.split(/[\r\n]/g);
    const start = {
      line: 0,
      column: 0
    };
    const end = {
      line: lines.length - 1,
      column: lines[lines.length - 1].length
    };
    super(str, start, end);
    this.rawLines = lines;
    this.range = [0, str.length];
  }
}

export class Line extends Token {
  tokens = [];
  section;

  constructor (lineNumber, str) {
    const start = {
      line: lineNumber,
      column: 0
    };
    const end = {
      line: lineNumber,
      column: str.length
    };
    super(str, start, end);
  }
}

export class BasicToken extends Token {
  constructor (lineNumber, charNum, str) {
    const start = {
      line: lineNumber,
      column: charNum
    };
    const end = {
      line: lineNumber,
      column: charNum + str.length
    };
    super(str, start, end);
  }
}

export class QuotedToken extends Token {
  quoteType;

  constructor (lineNumber, charNum, str, quoteType) {
    const start = {
      line: lineNumber,
      column: charNum
    };
    const end = {
      line: lineNumber,
      column: charNum + str.length + (quoteType ? 2 : 0)
    };
    super(str, start, end);
    this.quoteType = quoteType;
  }
}

export class Value extends QuotedToken { }

export class Key extends QuotedToken { }
export class CompositeKey extends Key {
  keys;
  constructor (lineNumber, charNum, keys, quoteType) {
    let str = '';
    for (const k of keys) {
      str += (str ? '.' : '') + k.content;
    }
    super(lineNumber, charNum, str, quoteType);
    this.keys = keys;
  }
}

export class Section extends QuotedToken {
  keys;
  constructor (lineNumber, charNum, str) {
    super(lineNumber, charNum, str, '[');
  }
}

export class Delimiter extends BasicToken { }

export class Whitespace extends BasicToken { }

export class Comment extends BasicToken { }
