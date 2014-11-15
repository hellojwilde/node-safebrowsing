var url = require('url');

var PROTOCOL_VERSION = 3.0;

var FullHashRequestType = {
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

  }
};

module.exports = FullHashRequestType;