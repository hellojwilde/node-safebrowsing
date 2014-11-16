var ChunkTypes = require('./ChunkTypes');
var FullHashRequestType = require('./io/FullHashRequestType');
var Promise = require('bluebird');

var regeneratorRuntime = require('regenerator/runtime');
var sendRequest = require('./io/sendRequest');

var fetchFullHashes = Promise.coroutine(function*(cache, apiKey, prefix) {
  var hashes = yield sendRequest(FullHashRequestType, {
    apiKey: apiKey,
    prefixes: [prefix]
  });

  yield Promise.each(hashes.lists, function(list) {
    return cache.putPrefixDetails(
      list.name, prefix, list.hashes, hashes.delay, list.metadata
    );
  });
});

module.exports = fetchFullHashes;
