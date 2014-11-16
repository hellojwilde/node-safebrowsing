var Promise = require('bluebird');

var _ = require('lodash');

function getChunkSetKey(listName, type) {
  return `safe:list:${listName}:chunks:${type}`;
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

function getPrefixDetailsKey(listName, prefix) {
  return `safe:list:${listName}:prefix:${prefix}`;
}

function getPrefixDetailsMetadataKey(listName, prefix) {
  return `${getPrefixDetailsKey(listName, prefix)}:metadata`;
}

function ensureArrayIfEmpty(promise) {
  return promise.then((val) => val || []);
}

function ensureParsedJSONObject(promise) {
  return promise.then((val) => (val) ? JSON.parse(val) : {});
}

function ensureBoolean(promise) {
  return promise.then((val) => !!val);
}

class RedisCache {
  constructor(redisClient) {
    this._client = Promise.promisifyAll(redisClient);
  }

  getChunkIDs(listName, type) {
    return ensureArrayIfEmpty(
      this._client.zrangeAsync(getChunkSetKey(listName, type), 0, -1)
    ).then((ids) => ids.map((id) => parseInt(id, 10)));
  }

  hasChunkID(listName, type, chunkID) {
    return ensureBoolean(
      this._client.zrankAsync(getChunkSetKey(listName, type), chunkID)
    );
  }

  getChunkByID(listName, chunkID) {
    return ensureArrayIfEmpty(
      this._client.smembersAsync(getChunkKey(listName, chunkID))
    );
  }

  putChunk(listName, type, chunkID, prefixes) {
    var transaction = this._client.multi()
      .zadd(getChunkSetKey(listName, type), chunkID, chunkID);

    if (prefixes.length > 0) {
      transaction.sadd(getChunkKey(listName, chunkID), prefixes);
    }

    return Promise.promisify(transaction.exec, transaction)();
  }

  dropChunkByID(listName, type, chunkID) {
    var transaction = this._client.multi()
      .zrem(getChunkSetKey(listName, type), chunkID)
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
    return ensureBoolean(
      this._client.sismemberAsync(getPrefixesKey(listName), prefix)
    );
  }

  putPrefixes(listName, prefixes) {
    if (prefixes.length === 0) {
      return Promise.resolve();
    }
    return this._client.saddAsync(getPrefixesKey(listName), prefixes);
  }

  dropPrefixes(listName, prefixes) {
    if (prefixes.length === 0) {
      return Promise.resolve();
    }
    return this._client.sremAsync(getPrefixesKey(listName), prefixes);
  }

  hasPrefixDetails(listName, prefix) {
    return ensureBoolean(
      this._client.existsAsync(getPrefixDetailsKey(listName, prefix))
    );
  }

  isPrefixDetailsMatch(listName, prefix, hash) {
    return ensureBoolean(
      this._client.sismemberAsync(getPrefixDetailsKey(listName, prefix), hash)
    );
  }

  getPrefixDetailsMetadata(listName, prefix) {
    return ensureParsedJSONObject(
      this._client.getAsync(getPrefixDetailsMetadataKey(listName, prefix))
    );
  }

  putPrefixDetails(listName, prefix, hashes, expiration, optMetadata) {
    var prefixDetailsKey = getPrefixDetailsKey(listName, prefix);

    var transaction = this._client.multi()
      .sadd(prefixDetailsKey, hashes)
      .expireat(prefixDetailsKey, expiration);

    if (optMetadata) {
      var prefixDetailsMetadataKey = 
        getPrefixDetailsMetadataKey(listName, prefix);

      transaction
        .set(prefixDetailsMetadataKey, JSON.stringify(optMetadata))
        .expireat(prefixDetailsMetadataKey, expiration);
    }
      
    return Promise.promisify(transaction.exec, transaction)();
  }
}

module.exports = RedisCache;
