var MatchResultTypes = require('./MatchResultTypes');
var Promise = require('bluebird');

var regeneratorRuntime = require('regenerator/runtime');
var getFullHashesResult = require('./getFullHashesResult');

var getListResult = Promise.coroutine(function*(cache, list, hashObjects, exprs) {
  var listResults = {
    resultType: null,
    metadata: [],
    hashObjects: []
  };

  var prefixResults = yield Promise.map(hashObjects, function(hashObject) {
    return Promise.props({
      hashObject: hashObject, 
      isPrefixMatch: cache.isPrefixMatch(list.name, hashObject.prefix)
    });
  });

  var prefixMatches = prefixResults.filter(function(prefixResult) {
    return prefixResult.isPrefixMatch;
  });

  if (prefixMatches.length === 0) {
    listResults.resultType = MatchResultTypes.NO_MATCH;
    return listResults;
  }

  var fullHashesResult = yield getFullHashesResult(
    cache, 
    list, 
    prefixMatches.map((prefixResult) => prefixResult.hashObject)
  );

  return fullHashesResult;
});

module.exports = getListResult;