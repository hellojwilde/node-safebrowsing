var FakeRedis = require('fakeredis');
var RedisCache = require('../../cache/RedisCache');
var Promise = require('bluebird');

var expect = require('expect');
var updateAddChunkPrefixes = require('../updateAddChunkPrefixes');
var sinon = require('sinon');

describe('updateAddChunkPrefixes', function() {
  var cache = new RedisCache(FakeRedis.createClient());
  var listName = 'list';

  it('should only call putPrefixes with [] if [] provided', function() {
    var mockCache = sinon.mock(cache);
    mockCache.expects('hasPendingSubChunk').never();
    mockCache.expects('dropPendingSubChunk').never();
    mockCache.expects('putPrefixes').once()
      .withArgs(listName, [])
      .returns(Promise.resolve()); 

    return updateAddChunkPrefixes(cache, listName, 1234, [])
      .then(function() {
        mockCache.verify();
        mockCache.restore();
      });
  });

  it('should add all if none pending', function() {
    var prefixes = ['abce', 'abcd', 'aghe'];
    var mockCache = sinon.mock(cache);

    // TODO (jwilde): Check arguments called on these methods.
    mockCache.expects('hasPendingSubChunk').thrice()
      .returns(Promise.resolve(false));
    mockCache.expects('dropPendingSubChunk').never();
    mockCache.expects('putPrefixes').once()
      .withArgs(listName, prefixes)
      .returns(Promise.resolve());

    return updateAddChunkPrefixes(cache, listName, 1234, prefixes)
      .then(function() {
        mockCache.verify();
        mockCache.restore();
      });
  });

  it('should skip + drop pending', function() {
    var prefixes = ['abce', 'abd'];
    var chunkID = 1234;
    var mockCache = sinon.mock(cache);

    // TODO (jwilde): check arguments passed to each of these methods.
    mockCache.expects('hasPendingSubChunk').twice()
      .returns(Promise.resolve(true));
    mockCache.expects('dropPendingSubChunk').twice()
      .returns(Promise.resolve());
    mockCache.expects('putPrefixes').once()
      .withArgs(listName, [])
      .returns(Promise.resolve());

    return updateAddChunkPrefixes(cache, listName, chunkID, prefixes)
      .then(function() {
        mockCache.verify();
        mockCache.restore();
      });
  });
});