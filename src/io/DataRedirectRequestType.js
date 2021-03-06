var ByteBuffer = require('bytebuffer');
var ProtoBuf = require('protobufjs');

var path = require('path');

var ChunkData = 
  ProtoBuf
    .loadProtoFile(path.join(__dirname, 'ChunkData.proto'))
    .build('ChunkData');

var DataRedirectRequestType = {
  isBinary: true,

  parseResponseBody: function(rsp) {
    var buf = ByteBuffer.wrap(rsp);
    var chunks = [];

    while (buf.remaining() > 0) {
      var size = buf.readUint32();
      var slice = buf.slice(buf.offset, buf.offset + size);
      buf.skip(size);
      chunks.push(ChunkData.decode(slice.toBuffer()));
    }

    return chunks;
  }
};

module.exports = DataRedirectRequestType;
