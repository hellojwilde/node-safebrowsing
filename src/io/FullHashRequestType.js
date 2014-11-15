var StringCursor = require('../utils/StringCursor');

var url = require('url');
var _ = require('lodash');

var PROTOCOL_VERSION = '3.0';

var FullHashRequestType = {
  isBinary: true,

  getRequestURL: function(props) {
    return url.format({
      protocol: 'https',
      hostname: 'safebrowsing.google.com',
      pathname: 'safebrowsing/gethash',
      query: {
        client: 'api',
        key: props.apiKey,
        appver: props.clientVersion,
        pver: PROTOCOL_VERSION
      }
    });
  },

  getRequestBody: function(props) {
    var prefixSize = props.prefixSize || 0;
    var prefixes = props.prefixes || [];

    return [
      [prefixSize, prefixes.length * prefixSize].join(':'),
      prefixes.join('')
    ].join('\n');
  },

  parseResponseBody: function(rsp) {
    var cursor = new StringCursor(rsp);
    var result = {
      delay: parseInt(cursor.chompUntil('\n'), 10), 
      lists: {}
    };

    while (cursor.remaining() > 0) {
      var listName = cursor.chompUntil(':');
      var hashSize = parseInt(cursor.chompUntil(':'), 10);
      var numResponses = parseInt(cursor.chompWhile(/[0-9]/), 10);

      var hasMetadata = cursor.peek(2) === ':m';
      cursor.skip(hasMetadata ? 3 : 1);

      var hashCursor = new StringCursor(cursor.chomp(hashSize * numResponses));
      var hashes = [];
      for (var i = 0; i < numResponses; i++) {
        hashes.push(hashCursor.chomp(hashSize));
      }

      var metadata = [];
      if (hasMetadata) {
        for (var i = 0; i < numResponses; i++) {
          var metaitemLength = parseInt(cursor.chompUntil('\n'), 10);
          var metaitemData = cursor.chomp(metaitemLength);
          metadata.push(metaitemData);
        }
      }

      result.lists[listName] = hashes.map(function(hash, idx) {
        return {
          hash: hash,
          metadata: hasMetadata ? metadata[idx] : null
        };
      });
    }

    return result;
  }
};

module.exports = FullHashRequestType;