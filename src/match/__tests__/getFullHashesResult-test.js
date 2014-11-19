var MatchResultTypes = require('../MatchResultTypes');
var RedisCache = require('../../cache/RedisCache');
var FakeRedis = require('fakeredis');
var Promise = require('bluebird');

var expect = require('expect');
var sinon = require('sinon');
var rewire = require('rewire');

var getFullHashesResult = rewire('../getFullHashesResult');

describe('getFullHashesResult', function() {
  var cache = new RedisCache(FakeRedis.createClient());
  var listName = 'list';
  var list = {name: listName};
  var hashObjects = [
    {prefix: 'abjhkc', hash: 'abcdef'},
    {prefix: 'dfgd', hash: 'sdfafsdfa'},
    {prefix: 'djhjkfd', hash: 'sdfafsdfa'}
  ];

  function testMatches(matchResults, finalResult) {
    var mockGetFullHashResult = sinon.stub();

    hashObjects.forEach(function (hashObject, idx) {
      mockGetFullHashResult
        .withArgs(cache, list, hashObject)
        .returns(Promise.resolve({
          resultType: matchResults[idx],
          hashObject: hashObject,
          metadata: null
        }));
    });

    return getFullHashesResult.__with__({
      getFullHashResult: mockGetFullHashResult
    })(function() {
      return getFullHashesResult(cache, list, hashObjects)
        .then((result) => expect(result.resultType).toBe(finalResult));
    });
  }

  it('should return match if any match', function() {
    return testMatches(
      [
        MatchResultTypes.NO_MATCH, 
        MatchResultTypes.MATCH,
        MatchResultTypes.NO_MATCH
      ],
      MatchResultTypes.MATCH
    );
  });

  it('should return inconclusive if no matches, inconclusive', function() {
    return testMatches(
      [
        MatchResultTypes.NO_MATCH, 
        MatchResultTypes.INCONCLUSIVE,
        MatchResultTypes.NO_MATCH
      ],
      MatchResultTypes.INCONCLUSIVE
    );
  });

  it('should return no match if only no matches', function() {
    return testMatches(
      [
        MatchResultTypes.NO_MATCH, 
        MatchResultTypes.NO_MATCH,
        MatchResultTypes.NO_MATCH
      ],
      MatchResultTypes.NO_MATCH
    );
  });
});
