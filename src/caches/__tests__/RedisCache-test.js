var expect = require('expect');

var FakeRedis = require('fakeredis');
var Promise = require('bluebird')
var RedisCache = require('../RedisCache');

describe('RedisCache', function() {
  var listName = 'woot';

  describe('Chunks', function() {
    it('has empty getChunkIDs intiially', function() {
      var cache = new RedisCache(FakeRedis.createClient());

      return cache.getChunkIDs()
        .then(function(actualChunkIDs) {
          expect(actualChunkIDs).toEqual([]);
        });
    });

    it('supports putChunk and updates getChunkIDs', function() { 
      var cache = new RedisCache(FakeRedis.createClient());
      var chunkIDs = [1, 2, 4];

      return Promise.all(chunkIDs.map((ID) => cache.putChunk(listName, ID, [])))
        .then(() => cache.getChunkIDs(listName))
        .then((actualChunkIDs) => expect(actualChunkIDs).toEqual(chunkIDs));
    });

    it('supports dropChunkByID and updates getChunkIDs', function() {
      var cache = new RedisCache(FakeRedis.createClient());
      
      return Promise.all([1, 2, 4].map((ID) => cache.putChunk(listName, ID, [])))
        .then(() => cache.dropChunkByID(listName, 2))
        .then(() => cache.getChunkIDs(listName))
        .then((actualChunkIDs) => expect(actualChunkIDs).toEqual([1, 4]));
    });

    it('supports getting prefixes by ID', function() {
      var cache = new RedisCache(FakeRedis.createClient());
      var chunkID = 4;
      var prefixes = [2, 3];

      return cache.putChunk(listName, chunkID, prefixes)
        .then(() => cache.getChunkByID(listName, chunkID))
        .then((actualPrefixes) => expect(actualPrefixes).toEqual(prefixes));
    });
  });

  describe('Pending Sub Chunks', function () {
    var cache = new RedisCache(FakeRedis.createClient());
    var chunkID = 4;
    var prefix = 34897234;
    var additions = [
      {chunkID: 1, prefix: 234234},
      {chunkID: 2, prefix: 3432},
      {chunkID: 2, prefix: 343234},
      {chunkID: chunkID, prefix: prefix},
    ];

    it('should not match anything initially', function() {
      return cache.hasPendingSubChunk(listName, chunkID, prefix)
        .then((actualHasChunk) => expect(actualHasChunk).toBe(false));
    });

    it('should match after some things are added', function() {
      return Promise.all(additions.map(function(additions) {
        return cache.putPendingSubChunk(
          listName, 
          additions.chunkID, 
          additions.prefix
        );
      }))
        .then(() => cache.hasPendingSubChunk(listName, chunkID, prefix))
        .then((actualHasChunk) => expect(actualHasChunk).toBe(true));
    });

    it('should stop matching after the item is removed', function() {
      return cache.dropPendingSubChunk(listName, chunkID, prefix)
        .then(() => cache.hasPendingSubChunk(listName, chunkID, prefix))
        .then((actualHasChunk) => expect(actualHasChunk).toBe(false));
    });
  });
});
