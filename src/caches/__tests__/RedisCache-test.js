var expect = require('expect');

var ChunkTypes = require('../../io/ChunkTypes');
var FakeRedis = require('fakeredis');
var Promise = require('bluebird')
var RedisCache = require('../RedisCache');

FakeRedis.fast = true;

describe('RedisCache', function() {
  var listName = 'woot';

  describe('Chunks', function() {
    it('has empty getChunkIDs intiially', function() {
      var cache = new RedisCache(FakeRedis.createClient());

      return cache.getChunkIDs(ChunkTypes.ADD)
        .then(function(actualChunkIDs) {
          expect(actualChunkIDs).toEqual([]);
        });
    });

    it('supports putChunk and updates getChunkIDs', function() { 
      var cache = new RedisCache(FakeRedis.createClient());
      var chunkIDs = [1, 2, 4];

      return Promise.all(
        chunkIDs.map((ID) => cache.putChunk(listName, ChunkTypes.ADD, ID, []))
      )
        .then(() => cache.getChunkIDs(listName, ChunkTypes.ADD))
        .then((actualChunkIDs) => expect(actualChunkIDs).toEqual(chunkIDs));
    });

    it('supports dropChunkByID and updates getChunkIDs', function() {
      var cache = new RedisCache(FakeRedis.createClient());
      
      return Promise.all(
        [1, 2, 4].map((ID) => cache.putChunk(listName, ChunkTypes.ADD, ID, []))
      )
        .then(() => cache.dropChunkByID(listName, ChunkTypes.ADD, 2))
        .then(() => cache.getChunkIDs(listName, ChunkTypes.ADD))
        .then((actualChunkIDs) => expect(actualChunkIDs).toEqual([1, 4]));
    });

    it('supports getting prefixes by ID', function() {
      var cache = new RedisCache(FakeRedis.createClient());
      var chunkID = 4;
      var prefixes = [2, 3];

      return cache.putChunk(listName, ChunkTypes.ADD, chunkID, prefixes)
        .then(() => cache.getChunkByID(listName, chunkID))
        .then((actualPrefixes) => expect(actualPrefixes).toEqual(prefixes));
    });
  });

  describe('Pending Sub Chunks', function() {
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

  describe('Prefixes', function() {
    var cache = new RedisCache(FakeRedis.createClient());

    var prefix = 92374;
    var prefixes = [98234, 93473435, 9742134, 982374198437, prefix];

    it('should not match anything initially', function() {
      return cache.isPrefixMatch(listName, prefix)
        .then((actualHasPrefix) => expect(actualHasPrefix).toBe(false));
    });

    it('should match after we add some prefixes', function() {
      return cache.putPrefixes(listName, prefixes)
        .then(() => cache.isPrefixMatch(listName, prefix))
        .then((actualHasPrefix) => expect(actualHasPrefix).toBe(true));
    });

    it('should stop matching after that prefix is dropped', function() {
      return cache.dropPrefixes(listName, [prefix])
        .then(() => cache.isPrefixMatch(listName, prefix))
        .then((actualHasPrefix) => expect(actualHasPrefix).toBe(false));
    });
  });

  describe('Prefix Details', function() {
    var cache = new RedisCache(FakeRedis.createClient());

    var prefix = 92374;
    var hash = 92374345791342987;
    var irrelevant = [
      9237409872314798243, 
      923740998237487934298243,
      923740989782347893423
    ];
    var relevant = irrelevant.concat(hash);
    var meta = {woot: true};
    var expires = Date.now() + 10000;

    it('should not match or show data intiially', function() {
      return cache.hasPrefixDetails(listName, prefix)
        .then((actualHasPrefix) => expect(actualHasPrefix).toBe(false))
        .then(() => cache.isPrefixDetailsMatch(listName, prefix, hash))
        .then((actualMatch) => expect(actualMatch).toBe(false));
    });

    it('should not match but show data if irrelevant hashes', function() {
      return cache.putPrefixDetails(listName, prefix, irrelevant, expires)
        .then(() => cache.hasPrefixDetails(listName, prefix))
        .then((actualHasPrefix) => expect(actualHasPrefix).toBe(true))
        .then(() => cache.isPrefixDetailsMatch(listName, prefix, hash))
        .then((actualMatch) => expect(actualMatch).toBe(false));
    });

    it('should match and have metadata', function() {
      return cache.putPrefixDetails(listName, prefix, relevant, expires, meta)
        .then(() => cache.hasPrefixDetails(listName, prefix))
        .then((actualHasPrefix) => expect(actualHasPrefix).toBe(true))
        .then(() => cache.isPrefixDetailsMatch(listName, prefix, hash))
        .then((actualMatch) => expect(actualMatch).toBe(true))
        .then(() => cache.getPrefixDetailsMetadata(listName, prefix))
        .then((actualMeta) => expect(actualMeta).toEqual(meta))
    });
  });
});
