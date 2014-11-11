var expect = require('expect');
var parsePrefixResponseBody = require('../parsePrefixResponseBody');

describe('parsePrefixResponseBody', function() {
  it('should parse Google example', function() {
    var rsp = (
      'n:1200\n' +
      'i:googpub-phish-shavar\n' +
      'u:cache.google.com/first_redirect_example\n' +
      'sd:1,2\n' +
      'i:acme-white-shavar\n' +
      'u:cache.google.com/second_redirect_example\n' +
      'ad:1-2,4-5,7\n' +
      'sd:2-6'
    );

    var expected = {
      'delay': 1200,
      'lists': {
        'googpub-phish-shavar': {
          'url': 'cache.google.com/first_redirect_example',
          'expireSub': [1, 2]
        },
        'acme-white-shavar': {
          'url': 'cache.google.com/second_redirect_example',
          'expireAdd': [[1,2], [4,5], 7],
          'expireSub': [[2, 6]]
        }
      }
    };

    expect(parsePrefixResponseBody(rsp)).toEqual(expected);
  });
});