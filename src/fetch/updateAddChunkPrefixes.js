var Promise = require('bluebird');

/**
 * Adds all of the prefixes that haven't been markd with a pending sub.
 * Drop pending sub chunks for things that we're skipping over.
 */
function updateAddChunkPrefixes(cache, listName, chunkID, prefixes) {
  return Promise.filter(prefixes, function(prefix) {
    return cache.hasPendingSubChunk(listName, chunkID, prefix)
      .then(function(hasPending) {
        if (hasPending) {
          return cache.dropPendingSubChunk(listName, chunkID, prefix)
            .then(() => false);
        }
        return true;
      });
  }).then((validPrefixes) => cache.putPrefixes(listName, validPrefixes));
}

module.exports = updateAddChunkPrefixes;
