var RedisCache = require('../../cache/RedisCache');
var FakeRedis = require('fakeredis');
var Promise = require('bluebird');

var assert = require('assert');
var expect = require('expect');
var rewire = require('rewire');
var sinon = require('sinon');

var fetchData = rewire('../fetchData');

describe('fetchData', function() {
  var cache = new RedisCache(FakeRedis.createClient());

  it('should throw on isReset response', function() {
    var mockSendRequest = sinon.stub()
      .returns(Promise.resolve({
        delay: 500, 
        isReset: true, 
        lists: []
      }));

    return fetchData.__with__({
      sendRequest: mockSendRequest
    })(function() {
      return fetchData(cache, 'abc', [])
        .then(() => assert(false))
        .catch(() => assert(mockSendRequest.called));
    });
  });

  it('should expire all expire ranges and call fetch', function() {
    var mockSendRequest = sinon.stub()
      .returns(Promise.resolve({
        delay: 500,
        isReset: false,
        lists: [{
          name: 'my happy list',
          urls: ['a url', 'another url'],
          expireAdd: [1, 2, 3],
          expireSub: [[7, 12]]
        }]
      }));

    var mockExpireChunkRanges = sinon.stub().returns(Promise.resolve());
    var mockFetchDataRedirect = sinon.stub().returns(Promise.resolve());

    return fetchData.__with__({
      sendRequest: mockSendRequest,
      expireChunkRanges: mockExpireChunkRanges,
      fetchDataRedirect: mockFetchDataRedirect
    })(function() {
      return fetchData(cache, 'abc', ['my happy list'])
        .then(function() {
          // TODO (jwilde): Check the arguments passed to these methods.
          assert(mockExpireChunkRanges.calledTwice);
          assert(mockFetchDataRedirect.calledTwice);
        });
    });
  });
});