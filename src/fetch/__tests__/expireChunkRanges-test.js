var FakeRedis = require('fakeredis');
var RedisCache = require('../../cache/RedisCache');
var ChunkTypes = require('../ChunkTypes');
var Promise = require('bluebird');

var expect = require('expect');
var expireChunkRanges = require('../expireChunkRanges');
var sinon = require('sinon');

describe('expireChunkRanges', function() {
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

    return expireChunkRanges(cache, listName, ChunkTypes.ADD, ranges)
      .then(function() {
        mockCache.verify();
        mockCache.restore();
      });
  });
});