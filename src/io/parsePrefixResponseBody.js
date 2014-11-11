var Parser = require('nearley').Parser;
var PrefixResponseBody = require('./PrefixResponseBody');

function parsePrefixResponseBody(rsp) {
  var parser = new Parser(
    PrefixResponseBody.ParserRules, 
    PrefixResponseBody.ParserStart
  );

  parser.feed(rsp);
  return parser.results[0];
}

module.exports = parsePrefixResponseBody;