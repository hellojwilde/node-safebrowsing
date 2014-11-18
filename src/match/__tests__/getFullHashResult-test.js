var MatchResultTypes = require('../MatchResultTypes');
var RedisCache = require('../../cache/RedisCache');
var FakeRedis = require('fakeredis');
var Promise = require('bluebird');

var getFullHashResult = require('../getFullHashResult');
var expect = require('expect');
var sinon = require('sinon');

describe('getFullHashResult', function() {
  var cache = new RedisCache(FakeRedis.createClient());
  var listName = 'list';
  var list = {name:listName}
  var prefix = 'abc';
  var hash = 'abcdef'

  function testWithResults(hasPrefixDetails, isPrefixDetailsMatch, resultType) {
    var mockCache = sinon.mock(cache);
    mockCache.expects('hasPrefixDetails').once()
      .withArgs(listName, prefix)
      .returns(Promise.resolve(hasPrefixDetails));
    mockCache.expects('isPrefixDetailsMatch').once()
      .withArgs(listName, prefix, hash)
      .returns(Promise.resolve(isPrefixDetailsMatch));
    mockCache.expects('getPrefixDetailsMetadata').never();

    return getFullHashResult(cache, {name:listName}, prefix, hash)
      .then(function(result) {
        expect(result.resultType).toBe(resultType);
        mockCache.verify();
        mockCache.restore();
      });
  }

  it('should return no match if details and no match', function() {
    return testWithResults(true, false, MatchResultTypes.NO_MATCH);
  });

  it('should return inconclusive if no details', function() {
    return testWithResults(false, false, MatchResultTypes.INCONCLUSIVE);
  });

  it('should return match if details and match', function() {
    var metadata = {woot: true};
    var mockCache = sinon.mock(cache);
    mockCache.expects('hasPrefixDetails').once()
      .withArgs(listName, prefix)
      .returns(Promise.resolve(true));
    mockCache.expects('isPrefixDetailsMatch').once()
      .withArgs(listName, prefix, hash)
      .returns(Promise.resolve(true));
    mockCache.expects('getPrefixDetailsMetadata').once()
      .withArgs(listName, prefix, hash)
      .returns(Promise.resolve(metadata));

    return getFullHashResult(cache, {name:listName}, prefix, hash)
      .then(function(result) {
        expect(result.resultType).toBe(MatchResultTypes.MATCH);
        expect(result.metadata).toEqual(metadata);
        mockCache.verify();
        mockCache.restore();
      });
  });
});