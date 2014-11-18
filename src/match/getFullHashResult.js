var Promise = require('bluebird');
var MatchResultTypes = require('./MatchResultTypes');

var regeneratorRuntime = require('regenerator/runtime');

var getFullHashResult = Promise.coroutine(function*(cache, list, hashObject) {
  var hashResult = {
    resultType: null,
    hashObject: hashObject,
    metadata: {}
  };

  var hasDetails = yield cache.hasPrefixDetails(
    list.name, 
    hashObject.prefix
  );

  var isDetailMatch = yield cache.isPrefixDetailsMatch(
    list.name, 
    hashObject.prefix, 
    hashObject.hash
  );

  if (!hasDetails) {
    hashResult.resultType = MatchResultTypes.INCONCLUSIVE;
  } else if (!isDetailMatch) {
    hashResult.resultType = MatchResultTypes.NO_MATCH;
  } else {
    hashResult.resultType = MatchResultTypes.MATCH;
    hashResult.metadata = yield cache.getPrefixDetailsMetadata(
      list.name, 
      hashObject.prefix, 
      hashObject.hash
    );
  }

  return hashResult;
});

module.exports = getFullHashResult;