var StringCursor = require('../util/StringCursor');

var _ = require('lodash');
var assert = require('assert');
var package = require('../../package.json');
var url = require('url');

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
        appver: props.clientVersion || package.version,
        pver: PROTOCOL_VERSION
      }
    });
  },

  getRequestBody: function(props) {
    var prefixes = props.prefixes || [];
    var prefixSizes = prefixes.map((prefix) => prefix.length);
    var prefixSize = _.tail(prefixSizes).reduce(function (prev, cur) {
      assert(prev === cur);
      return cur;
    }, _.head(prefixSizes));

    return [
      [prefixSize, prefixes.length * prefixSize].join(':'),
      prefixes.join('')
    ].join('\n');
  },

  parseResponseBody: function(buf) {
    var cursor = new StringCursor(buf.toString('binary'));
    var result = {
      delay: parseInt(cursor.chompUntil('\n'), 10), 
      lists: []
    };

    while (cursor.remaining() > 0) {
      var listName = cursor.chompUntil(':');
      var hashSize = parseInt(cursor.chompUntil(':'), 10);
      var numResponses = parseInt(cursor.chompWhile(/[0-9]/), 10);

      var hasMetadata = cursor.peek(2) === ':m';
      cursor.skip(hasMetadata ? 3 : 1);

      var hashes = new StringCursor(cursor.chomp(hashSize * numResponses))
        .divideRemaining(hashSize);

      var metadata = [];
      if (hasMetadata) {
        for (var i = 0; i < numResponses; i++) {
          var metaitemLength = parseInt(cursor.chompUntil('\n'), 10);
          var metaitemData = cursor.chomp(metaitemLength);
          metadata.push(metaitemData);
        }
      }

      result.lists.push({
        name: listName,
        hashes: hashes,
        metadata: metadata
      });
    }

    return result;
  }
};

module.exports = FullHashRequestType;