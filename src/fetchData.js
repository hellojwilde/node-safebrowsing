var ChunkTypes = require('./ChunkTypes');
var DataRequestType = require('./io/DataRequestType');
var Promise = require('bluebird');
var Ranges = require('./utils/Ranges');

var _ = require('lodash');
var fetchDataRedirect = require('./fetchDataRedirect');
var regeneratorRuntime = require('regenerator/runtime');
var sendRequest = require('./io/sendRequest');

var fetchData = Promise.coroutine(function*(cache, apiKey, lists) {
  var listNames = lists.map((list) => list.name);

  var listChunkRanges = yield Promise.map(listNames, function(listName) {
    return Promise.props({
      add: cache.getChunkIDs(listName, ChunkTypes.ADD),
      sub: cache.getChunkIDs(listName, ChunkTypes.SUB)
    }).then((results) => _.mapValues(results, Ranges.getRangesForNumbers));
  }).then((results) => _.zipObject(listNames, results));

  var listChunks = yield sendRequest(DataRequestType, {
    apiKey: apiKey, 
    lists: listChunkRanges
  });

  if (listChunks.isReset) {
    throw new Error('Reset not implemented');
  }

  yield Promise.each(listChunks.lists, function(list) {
    return Promise.each(list.urls, function(url) {
      return fetchDataRedirect(cache, list.name, url);
    });
  });

  return listChunks.delay;
});

module.exports = fetchData;
