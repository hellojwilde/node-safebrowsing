var FakeRedis = require('fakeredis');
var RedisCache = require('../../cache/RedisCache');
var Promise = require('bluebird');

var expect = require('expect');
var updateAddChunkPrefixes = require('../updateAddChunkPrefixes');
var sinon = require('sinon');

describe.only('expireChunkRanges', function() {
  var cache = new RedisCache(FakeRedis.createClient());
  var listName = 'list';

  it('should call methods for all specified chunks', function() {
    var ranges = [[1, 3], 5];
    var prefixes = ['a'];
    var mockCache = sinon.mock(cache);
    mockCache.expects('getChunkByID')
      .exactly(4).returns(Promise.resolve(['a']));
    mockCache.expects('dropPrefixes')
      .exactly(4).returns(Promise.resolve());
    mockCache.expects('dropPendingSubChunksByChunkID')
      .exactly(4).returns(Promise.resolve());
    mockCache.expects('dropChunkByID')
      .exactly(4).returns(Promise.resolve());
  });
});