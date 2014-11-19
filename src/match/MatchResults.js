var MatchResultTypes = require('./MatchResultTypes');

var _ = require('lodash');

class MatchResults {
  constructor(url, results, matcher, lists) {
    this._url = url;
    this._results = results;
    this._matcher = matcher;
    this._lists = lists;
  }

  getInconclusive(matchType) {
    return this._results.filter((res) => res.matchType === MatchResultTypes.INCONCLUSIVE);
  }

  getMatch(matchType) {
    return this._results.filter((res) => res.matchType === MatchResultTypes.MATCH);
  }

  getNoMatch(matchType) {
    return this._results.filter((res) => res.matchType === MatchResultTypes.INCONCLUSIVE);
  }

  getInconclusiveRequest() {
    return _.uniq(_.flatten(
      this.getResultsByMatchType(MatchResultTypes.INCONCLUSIVE)
        .map((result) => 
          result.hashObjects.map((hashObject) => hashObject.prefix)
        )
    ));
  }

  resolveInconclusive() {
    // TODO: More selectively match only the inconclusive results.
    // Ideally, we'd make the minimum number of cache requests here.
    return this._matcher.match(this._url, this._lists);
  }
}

module.exports = MatchResults;
