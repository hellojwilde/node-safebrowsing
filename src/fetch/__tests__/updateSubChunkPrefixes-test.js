var FakeRedis = require('fakeredis');
var RedisCache = require('../../cache/RedisCache');
var Promise = require('bluebird');

var expect = require('expect');
var updateSubChunkPrefixes = require('../updateSubChunkPrefixes');
var sinon = require('sinon');

describe('updateSubChunkPrefixes', function() {
  var cache = new RedisCache(FakeRedis.createClient());
  var listName = 'list';

  it('should only call dropPrefixes with [] if <[], []> provided', function() {
    var mockCache = sinon.mock(cache);
    mockCache.expects('hasPendingSubChunk').never();
    mockCache.expects('putPendingSubChunk').never();
    mockCache.expects('dropPrefixes').once()
      .withArgs(listName, [])
      .returns(Promise.resolve()); 

    return updateSubChunkPrefixes(cache, listName, 1234, [], [])
      .then(function() {
        mockCache.verify();
        mockCache.restore();
      });
  });

  it('should call putPendingSubChunk if no chunk ids there', function() {
    var prefixes = ['abce', 'abcd', 'aghe'];
    var addIDs = [1, 2, 3];

    var mockCache = sinon.mock(cache);
    mockCache.expects('hasChunkID').thrice()
      .returns(Promise.resolve(false));
    mockCache.expects('putPendingSubChunk').thrice()
      .returns(Promise.resolve());
    mockCache.expects('dropPrefixes').once()
      .withArgs(listName, [])
      .returns(Promise.resolve());

    return updateSubChunkPrefixes(cache, listName, 1234, prefixes, addIDs)
      .then(function() {
        mockCache.verify();
        mockCache.restore();
      });
  });

  it('should call dropPrefixes if chunk ids there', function() {
    var prefixes = ['abce', 'abd'];
    var addIDs = [1, 2];
    var chunkID = 1234;

    var mockCache = sinon.mock(cache);
    mockCache.expects('hasChunkID').twice()
      .returns(Promise.resolve(true));
    mockCache.expects('putPendingSubChunk').never();
    mockCache.expects('dropPrefixes').once()
      .withArgs(listName, prefixes)
      .returns(Promise.resolve());

    return updateSubChunkPrefixes(cache, listName, chunkID, prefixes, addIDs)
      .then(function() {
        mockCache.verify();
        mockCache.restore();
      });
  });
});