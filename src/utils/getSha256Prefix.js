var crypto = require('crypto');

function getSha256Prefix(input, byteLength) {
  var sha = crypto.createHash('sha256');
  sha.update(input);
  return sha.digest().slice(0, byteLength);
}

module.exports = getSha256Prefix;
