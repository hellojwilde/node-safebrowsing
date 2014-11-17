var Promise = require('bluebird');

/**
 * Adds all of the prefixes that haven't been markd with a pending sub.
 * Drop pending sub chunks for things that we're skipping over.
 * 
 * @param  {Cache}  cache    Instance of the cache to operate against.
 * @param  {String} listName List name in the cache to operate against.
 * @param  {Number} chunkID  Chunk number that prefixes are associated with.
 * @param  {Array}  prefixes Prefixes from an add chunk of number chunkID.
 * @return {Promise}         Resolves when the prefixes have been added.
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
