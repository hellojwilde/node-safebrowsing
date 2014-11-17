var Ranges = require('../util/Ranges');
var Promise = require('bluebird');

var regeneratorRuntime = require('regenerator/runtime');

/**
 * Drops all information related to the specified chunk ranges in the list.
 */
function expireChunkRanges(cache, listName, type, ranges) {
  var chunkIDs = Ranges.getNumbersForRanges(ranges);
  return Promise.each(chunkIDs, Promise.coroutine(function*(chunkID) {
    var prefixes = yield cache.getChunkByID(listName, chunkID);
    yield cache.dropPrefixes(listName, prefixes);
    yield cache.dropPendingSubChunksByChunkID(listName, chunkID);
    yield cache.dropChunkByID(listName, type, chunkID);
  }));
};

module.exports = expireChunkRanges;
