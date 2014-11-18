var MatchResultTypes = require('../MatchResultTypes');
var RedisCache = require('../../cache/RedisCache');
var FakeRedis = require('fakeredis');
var Promise = require('bluebird');

var assert = require('assert');
var expect = require('expect');
var sinon = require('sinon');
var rewire = require('rewire');

var getListResult = rewire('../getListResult');

describe('getListResult', function() {
  var cache = new RedisCache(FakeRedis.createClient());
  var listName = 'list';
  var list = {name: 'list'};
  var exprs = ['asdfasdfas', 'adsfafsdgewr', 'qwerewrewqr'];
  var hashObjects = [
    {prefix: 'abc', hash: 'asdfsdfasdfasdf'},
    {prefix: 'abc', hash: 'asdfsdfasdfasdf'},
    {prefix: 'abc', hash: 'asdfsdfasdfasdf'}
  ];

  it('should return no match if none of the prefixes pass', function() {
    var mockCache = sinon.mock(cache);

    hashObjects.forEach(function(hashObject) {
      mockCache.expects('isPrefixMatch')
        .withArgs(listName, hashObject.prefix)
        .returns(Promise.resolve(false))
        .once();
    });
    
    return getListResult(cache, list, hashObjects, exprs)
      .then(function(result) {
        expect(result.resultType).toBe(MatchResultTypes.NO_MATCH);
        mockCache.verify();
        mockCache.restore();
      });
  });

  it('should return match if prefixes + full hashes does', function() {
    var mockCache = sinon.mock(cache);
    var mockGetFullHashesResult = sinon.stub();

    hashObjects.forEach(function(hashObject) {
      mockCache.expects('isPrefixMatch')
        .withArgs(listName, hashObject.prefix)
        .returns(Promise.resolve(true))
        .once();

      mockGetFullHashesResult
        .returns(Promise.resolve({
          resultType: MatchResultTypes.MATCH,
          hashObjects: hashObjects,
          metadata: []
        }))
    });

    return getListResult.__with__({
      getFullHashesResult: mockGetFullHashesResult
    })(function () {
      return getListResult(cache, list, hashObjects, exprs)
        .then(function(result) {
          expect(result.resultType).toBe(MatchResultTypes.MATCH);
          assert(mockGetFullHashesResult.called);
          mockCache.verify();
          mockCache.restore();
        });
    });
  });
});