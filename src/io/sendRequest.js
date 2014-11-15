var request = require('request-promise');

function sendRequest(type, props) {
  return request({
    method: 'POST',
    uri: type.getRequestURL(props),
    body: type.getRequestBody(props)
  }).then(type.parseResponseBody);
}

module.exports = sendRequest;
