var request = require('request-promise');
var _ = require('lodash');

function sendRequest(type, props) {
  var mergedType = _.merge({
    isBinary: false,
    getRequestBody: function() { return null; },
  }, type);

  var options = {
    method: 'POST',
    uri: mergedType.getRequestURL(props),
    body: mergedType.getRequestBody(props)
  };

  if (type.isBinary) {
    options.encoding = null;
  }

  return request(options).then(mergedType.parseResponseBody);
}

module.exports = sendRequest;
