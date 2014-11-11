var _ = require('lodash');
var expect = require('expect');

var getPrefixRequestBody = require('../getPrefixRequestBody');

describe('getPrefixRequestBody', function() {
  var lists = {
    'googpub-phish-shavar': {
      'add': [1, 2, 3, 5, 8],
      'sub': [4, 5]
    },
    'acme-white-shavar': {
      'add': _.range(1, 8),
      'sub': [1, 2]
    }
  };

  it('should work without a size', function() {
    expect(getPrefixRequestBody(lists)).toBe(
      'googpub-phish-shavar;a:1-3,5,8:s:4-5\n' +
      'acme-white-shavar;a:1-7:s:1-2'
    );
  });

  it('should work with a size', function() {
    expect(getPrefixRequestBody(lists, 200)).toBe(
      's;200\n' +
      'googpub-phish-shavar;a:1-3,5,8:s:4-5\n' +
      'acme-white-shavar;a:1-7:s:1-2'
    );
  });
});