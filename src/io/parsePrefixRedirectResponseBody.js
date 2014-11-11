var ByteBuffer = require('bytebuffer');
var ProtoBuf = require('protobufjs');

var path = require('path');

var ChunkData = 
  ProtoBuf
    .loadProtoFile(path.join(__dirname, 'ChunkData.proto'))
    .build('ChunkData');

function parseRedirectResponseBody(buf) {
  var chunks = [];

  while (buf.remaining()) {
    var size = buf.readUint32();
    var slice = buf.slice(buf.offset, buf.offset + size);
    chunks.push(ChunkData.decode(slice.toBuffer()));
    buf.skip(size);
  }

  return chunks;
}

module.exports = parseRedirectResponseBody;