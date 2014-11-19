var DefaultLists = require('../list/DefaultLists');
var MatchResults = require('./MatchResults');
var MatchResultTypes = require('./MatchResultTypes');
var Promise = require('bluebird');

var _ = require('lodash');
var getCanonicalizedURL = require('../util/getCanonicalizedURL');
var getLookupExpressions = require('../util/getLookupExpressions');
var getSha256Prefix = require('../util/getSha256Prefix');
var getListResult = require('./getListResult');

class Matcher {
  constructor(cache) {
    this._cache = cache;
  }

  match(url, optLists) {
    var lists = optLists || DefaultLists;
    var canonicalized = getCanonicalizedURL(url);
    var exprs = getLookupExpressions(canonicalized);
    var prefixes = expressions.map((expr) => getSha256Prefix(expr, 4));

    return Promise.map(
      lists, 
      (list) => getListResult(this._cache, list, prefixes, exprs)
    ).then((matches) => new MatchResults(url, matches, this, optLists))
  }
}

module.exports = Matcher;