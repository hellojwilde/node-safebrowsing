jest.autoMockOff();

var FakeRedis = require('fakeredis');
var Promise = require('bluebird')
var RedisCache = require('../RedisCache');

describe('RedisCache', function() {
  describe('Chunks', function() {
    var listName = 'woot';

    it('has empty getChunkIDs intiially', function(done) {
      var cache = new RedisCache(FakeRedis.createClient());

      return cache.getChunkIDs('woot')
        .then(function(chunkIDs) {
          expect(chunkIDs).toEqual([]);
          done();
        });
    });

    it('supports putChunk and updates getChunkIDs', function(done) { 
      var cache = new RedisCache(FakeRedis.createClient());
      var chunkIDs = [1, 2, 4];

      Promise.all(chunkIDs.map((ID) => cache.putChunk(listName, ID, [])))
        .then(() => cache.getChunkIDs(listName))
        .then(function(actualChunkIDs) {
          expect(actualChunkIDs).toEqual(chunkIDs);
          done();
        });
    });

    it('supports dropChunkByID and updates getChunkIDs', function() {
      var cache = new RedisCache(FakeRedis.createClient());
      
      Promise.all([1, 2, 4].map((ID) => cache.putChunk(listName, ID, [])))
        .then(() => cache.dropChunkByID(listName, 2))
        .then(() => cache.getChunkIDs(listName))
        .then(function(actualChunkIDs) {
          expect(actualChunkIDs).toEqual([1, 4]);
          done();
        });
    });

    it('supports getting prefixes by ID', function() {
      var cache = new RedisCache(FakeRedis.createClient());
      var chunkID = 4;
      var prefixes = [2, 3];

      cache.putChunk(listName, chunkID, prefixes)
        .then(() => cache.getChunkByID(listName, chunkID))
        .then(function(actualPrefixes) {
          expect(actualPrefixes).toEqual(prefixes);
          done();
        });
    });
  });
});
