var Promise = require('bluebird');
var MatchResultTypes = require('./MatchResultTypes');

var regeneratorRuntime = require('regenerator/runtime');
var getFullHashResult = require('./getFullHashResult');

var getFullHashesResult = Promise.coroutine(function*(cache, list, hashObjects) {
  var fullHashesResult = {
    resultType: null,
    hashObjects: [],
    metadata: []
  };

  var hashResults = yield Promise.map(hashObjects, function(hashObject) {
    return getFullHashResult(cache, list, hashObject);
  });

  var hashMatches = hashResults.filter(function(res) {
    return res.resultType === MatchResultTypes.MATCH;
  });

  if (hashMatches.length > 0) {
    fullHashesResult.resultType = MatchResultTypes.MATCH;
    fullHashesResult.metadata = hashMatches.map((res) => res.metadata);
    return fullHashesResult;
  }

  var hashInconclusives = hashResults.filter(function(res) {
    return res.resultType === MatchResultTypes.INCONCLUSIVE;
  });

  if (hashInconclusives.length > 0) {
    fullHashesResult.resultType = MatchResultTypes.INCONCLUSIVE;
    fullHashesResult.hashObjects = 
      hashInconclusives.map((res) => res.hashObject);
  } else {
    fullHashesResult.resultType = MatchResultTypes.NO_MATCH;
  }

  return fullHashesResult;
});

module.exports = getFullHashesResult;
