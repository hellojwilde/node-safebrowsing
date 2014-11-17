var Ranges = require('../util/Ranges');
var Promise = require('bluebird');

var regeneratorRuntime = require('regenerator/runtime');

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
