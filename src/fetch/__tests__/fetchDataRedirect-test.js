var ChunkTypes = require('../ChunkTypes');
var RedisCache = require('../../cache/RedisCache');
var FakeRedis = require('fakeredis');
var Promise = require('bluebird');

var assert = require('assert');
var expect = require('expect');
var rewire = require('rewire');
var sinon = require('sinon');

var fetchDataRedirect = rewire('../fetchDataRedirect');

describe('fetchDataRedirect', function() {
  var cache = new RedisCache(FakeRedis.createClient());
  var listName = 'list';

  it('should insert an add chunk', function() {
    var mockCache = sinon.mock(cache);
    mockCache.expects('putChunk')
      .withArgs(listName, ChunkTypes.ADD, 4, ['abcd'])
      .returns(Promise.resolve())
      .once();

    var mockSendRequest = sinon.stub()
      .returns(Promise.resolve([{
        chunk_number: 4,
        chunk_type: 0,
        prefix_type: 0,
        hashes: 'abcd',
        add_numbers: null
      }]));
    var mockUpdateAddChunkPrefixes = sinon.stub().returns(Promise.resolve());
    var mockUpdateSubChunkPrefixes = sinon.stub().returns(Promise.resolve());

    return fetchDataRedirect.__with__({
      sendRequest: mockSendRequest,
      updateAddChunkPrefixes: mockUpdateAddChunkPrefixes,
      updateSubChunkPrefixes: mockUpdateSubChunkPrefixes
    })(function() {
      return fetchDataRedirect(cache, listName, 'https://example.com')
        .then(function() {
          assert(mockSendRequest.calledOnce);
          assert(
            mockUpdateAddChunkPrefixes
              .calledWith(cache, listName, 4, ['abcd'])
          );
          assert(!mockUpdateSubChunkPrefixes.called);
          mockCache.verify();
          mockCache.restore();
        });
    });
  });

  it('should insert a sub chunk', function() {
    var mockCache = sinon.mock(cache);
    mockCache.expects('putChunk')
      .withArgs(listName, ChunkTypes.SUB, 4, ['abcd'])
      .returns(Promise.resolve())
      .once();

    var mockSendRequest = sinon.stub()
      .returns(Promise.resolve([{
        chunk_number: 4,
        chunk_type: 1,
        prefix_type: 0,
        hashes: 'abcd',
        add_numbers: [3]
      }]));
    var mockUpdateAddChunkPrefixes = sinon.stub().returns(Promise.resolve());
    var mockUpdateSubChunkPrefixes = sinon.stub().returns(Promise.resolve());

    return fetchDataRedirect.__with__({
      sendRequest: mockSendRequest,
      updateAddChunkPrefixes: mockUpdateAddChunkPrefixes,
      updateSubChunkPrefixes: mockUpdateSubChunkPrefixes
    })(function() {
      return fetchDataRedirect(cache, listName, 'https://example.com')
        .then(function() {
          assert(mockSendRequest.calledOnce);
          assert(!mockUpdateAddChunkPrefixes.called);
          assert(
            mockUpdateSubChunkPrefixes
              .calledWith(cache, listName, 4, ['abcd'], [3])
          );
          mockCache.verify();
          mockCache.restore();
        });
    });
  });
});