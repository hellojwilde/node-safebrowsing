var Promise = require('bluebird');
var ChunkTypes = require('./ChunkTypes');

/**
 * For all of our <prefix, addNumber> combinations: if we have a stored add
 * chunk with number addNumber, drop the prefix; else, put in a pending sub.
 * 
 * @param  {Cache}    cache      [description]
 * @param  {String}   listName   [description]
 * @param  {Number}   chunkID    [description]
 * @param  {Array}    prefixes   [description]
 * @param  {Array}    addNumbers [description]
 * @return {Promise}              [description]
 */
function updateSubChunkPrefixes(cache, listName, chunkID, prefixes, addIDs) {
  return Promise.filter(prefixes, function(prefix, idx) {
    var addID = addIDs[idx];
    return cache.hasChunkID(listName, ChunkTypes.ADD, addID)
      .then(function(hasChunkID) {
        if (!hasChunkID) {
          return cache.putPendingSubChunk(listName, addID, prefix)
            .then(() => false);
        }
        return true;
      })
  }).then((foundPrefixes) => cache.dropPrefixes(listName, foundPrefixes));
}

module.exports = updateSubChunkPrefixes;