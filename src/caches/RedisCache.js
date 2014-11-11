var Promise = require('bluebird');

function getChunkSetKey(listName) {
  return `safe:list:${listName}:chunks`;
}

function getChunkKey(listName, chunkID) {
  return `safe:list:${listName}:chunk:${chunkID}`;
}

function getPendingSubKey(listName) {
  return `safe:list:${listName}:sub`;
}

function getPendingSubChunk(chunkID, prefix) {
  return `${chunkID}:${prefix}`;
}

function getPrefixesKey(listName) {
  return `safe:list:${listName}:prefixes`;
}

class RedisCache {
  constructor(redisClient) {
    this._client = Promise.promisifyAll(redisClient);
  }

  getChunkIDs(listName) {
    return this._client.smembersAsync(getChunkSetKey(listName))
      .then((chunkIDs) => chunkIDs || []);
  }

  getChunkByID(listName, chunkID) {
    return this._client.smembersAsync(getChunkKey(listName, chunkID))
      .then((prefixes) => prefixes || []);
  }

  putChunk(listName, chunkID, prefixes) {
    var transaction = this._client.multi()
      .sadd(getChunkSetKey(listName), chunkID)
      .sadd(getChunkKey(listName, chunkID), prefixes);

    return Promise.promisify(transaction.exec, transaction)();
  }

  dropChunkByID(listName, chunkID) {
    var transaction = this._client.multi()
      .srem(getChunkSetKey(listName), chunkID)
      .del(getChunkKey(listName, chunkID));

    return Promise.promisify(transaction.exec, transaction)();
  }

  hasPendingSubChunk(listName, chunkID, prefix) {
    return this._client.sismemberAsync(
      getPendingSubKey(listName),
      getPendingSubChunk(chunkID, prefix)
    ).then((hasSubChunk) => !!hasSubChunk);
  }

  putPendingSubChunk(listName, chunkID, prefix) {
    return this._client.saddAsync(
      getPendingSubKey(listName), 
      getPendingSubChunk(chunkID, prefix)
    );
  }

  dropPendingSubChunk(listName, chunkID, prefix) {
    return this._client.sremAsync(
      getPendingSubKey(listName),
      getPendingSubChunk(chunkID, prefix)
    );
  }

  isPrefixMatch(listName, prefix) {
    return this._client.sismemberAsync(getPrefixesKey(listName), prefix);
  }

  putPrefixes(listName, prefixes) {
    return this._client.saddAsync(getPrefixesKey(listName), prefixes);
  }

  dropPrefixes(listName, prefixes) {
    return this._client.sremAsync(getPrefixesKey(listName), prefixes);
  }
}

module.exports = RedisCache;
