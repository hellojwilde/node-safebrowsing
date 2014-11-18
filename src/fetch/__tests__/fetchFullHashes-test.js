var RedisCache = require('../../cache/RedisCache');
var FakeRedis = require('fakeredis');
var Promise = require('bluebird');

var assert = require('assert');
var expect = require('expect');
var rewire = require('rewire');
var sinon = require('sinon');

var fetchFullHashes = rewire('../fetchFullHashes');

describe('fetchFullHashes', function() {
  var cache = new RedisCache(FakeRedis.createClient());

  it('should call putPrefixDetails with the correct args', function() {
    var mockCache = sinon.mock(cache);
    var putPrefixDetails = mockCache.expects('putPrefixDetails')
      .withArgs(
        'goog-malware-shavar', 
        '0123', 
        ['01234567890123456789012345678901','98765432109876543210987654321098'],
        900,
        ['AA', 'BBB']
      );
      
    var mockSendRequest = sinon.stub()
      .returns(Promise.resolve({
        delay: 900,
        lists: [
          {
            name: 'goog-malware-shavar',
            hashes: [
              '01234567890123456789012345678901',
              '98765432109876543210987654321098'
            ],
            metadata: ['AA', 'BBB']
          }
        ]
      }));

    return fetchFullHashes.__with__({
      sendRequest: mockSendRequest
    })(function() {
      return fetchFullHashes(cache, 'abc','0123')
        .then(function() {
          mockCache.verify();
          mockCache.restore();
        });
    })
  });
});