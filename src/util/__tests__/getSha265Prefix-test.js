var Buffer = require('buffer').Buffer;

var expect = require('expect');
var getSha256Prefix = require('../getSha256Prefix');

describe('getSha256Prefix', function() {
  it('should digest abc', function() {
    expect(
      getSha256Prefix('abc', 4)
    ).toEqual(new Buffer([0xba, 0x78, 0x16, 0xbf]));
  });

  it('should digest long list of letters', function() {
    expect(getSha256Prefix(
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
      6
    )).toEqual(new Buffer([0x24, 0x8d, 0x6a, 0x61, 0xd2, 0x06]));
  });

  it('should digest a million a\'s', function() {
    var millionAs = '';
    for (var i = 0; i < 1000000; i++) millionAs += 'a';

    expect(getSha256Prefix(millionAs, 12)).toEqual(new Buffer([
      0xcd, 0xc7, 0x6e, 0x5c, 0x99, 0x14, 0xfb, 0x92, 0x81, 0xa1, 0xc7, 0xe2
    ]));
  });
});
