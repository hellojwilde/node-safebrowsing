var ChunkTypes = require('./ChunkTypes');
var DataRedirectRequestType = require('./io/DataRedirectRequestType');
var Promise = require('bluebird');
var StringCursor = require('./utils/StringCursor');

var _ = require('lodash');
var regeneratorRuntime = require('regenerator/runtime');
var sendRequest = require('./io/sendRequest');

var fetchDataRedirect = Promise.coroutine(function*(cache, listName, url) {
  var chunks = yield sendRequest(DataRedirectRequestType, {url: url});

  yield Promise.each(chunks, Promise.coroutine(function*(chunk) {
    var chunkID = chunk.chunk_number;
    var type = chunk.chunk_type === 0 ? ChunkTypes.ADD : ChunkTypes.SUB;

    var prefixes = [];
    if (chunk.hashes) {
      prefixes = new StringCursor(chunk.hashes.toString('binary'))
        .divideRemaining(chunk.prefix_type === 0 ? 4 : 32);
    }

    if (type === ChunkTypes.ADD) {
      // Add all of the prefixes that haven't been marked with a pending sub.
      // Drop pending sub chunks for things that we're skipping over.
      var validPrefixes = yield Promise.filter(
        prefixes, 
        Promise.coroutine(function*(prefix) {
          var hasPending = 
            yield cache.hasPendingSubChunk(listName, chunkID, prefix);

          if (hasPending) {
            yield cache.dropPendingSubChunk(listName, chunkID, prefix);
          }
          return !hasPending;
        })
      );

      yield cache.putPrefixes(listName, validPrefixes);
    } else {
      // Create pending subs for all of the items that haven't been dropped
      // because they haven't even been added yet.
      var prefixSubs = _.zip(prefixes, chunk.add_numbers);
      yield Promise.each(prefixSubs, Promise.coroutine(function*(prefixSub) {
        var prefix = prefixSub[0];
        var id = prefixSub[1];

        var hasChunkID = yield cache.hasChunkID(listName, ChunkTypes.ADD, id);
        if (!hasChunkID) {
          yield cache.putPendingSubChunk(listName, id, prefix);
        }
      }));

      yield cache.dropPrefixes(listName, prefixes);
    }

    yield cache.putChunk(listName, type, chunkID, prefixes);
  }));
});

module.exports = fetchDataRedirect;