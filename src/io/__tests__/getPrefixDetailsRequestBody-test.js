var expect = require('expect');
var getPrefixDetailsRequestBody = require('../getPrefixDetailsRequestBody');

describe('getPrefixDetailsRequestBody', function() {
  it('should support a basic contrived example', function () {
    var expected = (
      '15:30\n' +
      'aaaaaaaaaaaaaaabbbbbbbbbbbbbbb'
    );

    expect(getPrefixDetailsRequestBody(15, [
      'aaaaaaaaaaaaaaa', 
      'bbbbbbbbbbbbbbb'
    ])).toEqual(expected);
  });
});
