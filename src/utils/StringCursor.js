class StringCursor {
  constructor(str) {
    this._str = str;
    this._offset = 0;
  }

  remaining() {
    return this._str.length - this._offset;
  }

  chompUntil(delimiter) {
    var offset = this._offset;
    while (this._str.charAt(offset) != delimiter && 
           offset < this._str.length) {
      offset++;
    }

    var slice = this._str.slice(this._offset, offset);
    this._offset = offset + 1;
    return slice;
  }

  chompWhile(allowed) {
    var offset = this._offset;
    while (allowed.test(this._str.charAt(offset)) && 
           offset < this._str.length) {
      offset++;
    }

    var slice = this._str.slice(this._offset, offset);
    this._offset = offset;
    return slice;
  }

  chompLength(length) {
    var slice = this._str.slice(this._offset, this._offset + length);
    this._offset = Math.min(this._offset + length, this._str.length);
    return slice;
  }

  chompRemaining() {
    var slice = this._str.slice(this._offset);
    this._offset = this._str.length;
    return slice;
  }
}

module.exports = StringCursor;