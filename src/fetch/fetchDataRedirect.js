var ChunkTypes = require('./ChunkTypes');
var DataRedirectRequestType = require('../io/DataRedirectRequestType');
var Promise = require('bluebird');
var StringCursor = require('../util/StringCursor');
var Hashes = require('../util/Hashes');

var _ = require('lodash');
var regeneratorRuntime = require('regenerator/runtime');
var sendRequest = require('../io/sendRequest');
var updateAddChunkPrefixes = require('./updateAddChunkPrefixes');
var updateSubChunkPrefixes = require('./updateSubChunkPrefixes');

var DEFAULT_PREFIX_LENGTH = 4;
var LONG_PREFIX_LENGTH = 32;

var fetchDataRedirect = Promise.coroutine(function*(cache, listName, url) {
  var chunks = yield sendRequest(DataRedirectRequestType, {url: url});

  yield Promise.each(chunks, Promise.coroutine(function*(chunk) {
    var chunkID = chunk.chunk_number;
    var type = chunk.chunk_type === 0 ? ChunkTypes.ADD : ChunkTypes.SUB;
    var prefixLength = chunk.prefix_type === 0 ? 
      DEFAULT_PREFIX_LENGTH : LONG_PREFIX_LENGTH;
      
    var prefixes = []; 
    if (chunk.hashes) {
      prefixes = new StringCursor(chunk.hashes.toString('binary'))
        .divideRemaining(prefixLength)
        .map((prefix) => Hashes.getNormalizedPrefix(prefix));
    }

    if (type === ChunkTypes.ADD) {
      yield updateAddChunkPrefixes(cache, listName, chunkID, prefixes);
    } else {
      var addIDs = chunk.add_numbers;
      yield updateSubChunkPrefixes(cache, listName, chunkID, prefixes, addIDs);
    }

    yield cache.putChunk(listName, type, chunkID, prefixes);
  }));
});

module.exports = fetchDataRedirect;
