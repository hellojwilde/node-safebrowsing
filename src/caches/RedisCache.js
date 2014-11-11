var Promise = require('bluebird');

function getChunkSetKey(listName) {
  return `safe:list:${listName}:chunks`;
}

function getChunkKey(listName, chunkID) {
  return `safe:list:${listName}:chunk:${chunkID}`;
}

class RedisCache {
  constructor(redisClient) {
    this._client = Promise.promisifyAll(redisClient);
  }

  getChunkIDs(listName) {
    return this._client.getAsync(getChunkSetKey(listName))
      .then((chunkIDs) => chunkIDs || []);
  }

  getChunkById(listName, chunkID) {
    return this._client.getAsync(getChunkKey(listName, chunkID))
      .then((prefixes) => prefixes || []);
  }

  putChunk(listName, chunkID, prefixes) {
    return Promise.promisify(
      this._client.multi()
        .sadd(getChunkSetKey(listName), chunkID)
        .lpush(getChunkKey(listName, chunkID), prefixes)
        .exec
    )();
  }

  dropChunkById(listName, chunkID) {
    return Promise.promisify(
      this._client.multi()
        .srem(getChunkSetKey(listName), chunkID)
        .del(getChunkKey(listName, chunkID))
        .exec
    )();
  }
}

module.exports = RedisCache;
