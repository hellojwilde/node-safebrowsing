var _ = require('lodash');
var expect = require('expect');
var path = require('path');
var sendRequest = require('../sendRequest');

var ProtoBuf = require('protobufjs');
var ByteBuffer = require('bytebuffer');
var DataRedirectRequestType = require('../DataRedirectRequestType');

var ChunkData = 
  ProtoBuf
    .loadProtoFile(path.join(__dirname, '..', 'ChunkData.proto'))
    .build('ChunkData');

function getResponseBody(chunkData) {
  var chunks = chunkData.map((chunk) => new ChunkData(chunk).toBuffer());
  var buf = ByteBuffer.allocate(
    chunks.reduce((len, chunk) => len + chunk.length + 4, 0)
  );

  chunks.forEach(function(chunk) {
    buf.writeUint32(chunk.length);
    buf.append(chunk);
  });

  return buf.buffer;
}

function expectMessagesToBeEqual(actualMessage, message) {
  _.forOwn(message, function(value, key) {
    var actualValue = actualMessage[key];
    if (actualValue.toBuffer) {
      expect(actualValue.toBuffer()).toEqual(value);
    } else {
      expect(actualValue).toEqual(value);
    }
  });
}

describe('DataRedirectRequestType', function() {
  describe('parseResponseBody', function() {
    var chunks = [
      {
        chunk_number: 2,
        chunk_type: 0,
        prefix_type: 0,
        hashes: new Buffer('4h3k4h3k4h3k4h3k')
      },
      {
        chunk_number: 3,
        chunk_type: 0,
        prefix_type: 0,
        hashes: new Buffer('4h3k4h3k4h3k4h3k'),
        add_numbers: [2]
      }
    ];
    
    it('should work with this contrived example', function() {
      var rsp = getResponseBody(chunks);
      var actualChunks = DataRedirectRequestType.parseResponseBody(rsp);

      expect(actualChunks.length).toBe(chunks.length);
      chunks.forEach(function(chunk, idx) {
        expectMessagesToBeEqual(actualChunks[idx], chunk);
      });
    });
  });
});
