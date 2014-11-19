var DefaultLists = require('../list/DefaultLists');
var Promise = require('bluebird');

var _ = require('lodash');
var assert = require('assert');
var fetchData = require('./fetchData');
var fetchFullHashes = require('./fetchFullHashes');
var moment = require('moment');

function getDataDelayForErrorCount(errorCount) {
  assert(errorCount > 0);

  console.log(errorCount);

  var delay = 0;
  if (errorCount === 1) {
    delay = 1;
  } else if (errorCount === 2) {
    delay = _.random(30, 60);
  } else if (errorCount === 3) {
    delay = _.random(60, 120);
  } else if (errorCount === 4) {
    delay = _.random(120, 240);
  } else if (errorCount === 5) {
    delay = _.random(240, 480);
  } else {
    delay = 480;
  }

  return delay * 60 * 1000;
}

class Fetcher {
  constructor(cache, apiKey, optLists) {
    this.cache = cache;
    this.apiKey = apiKey;
    this.lists = optLists || DefaultLists;

    this._dataIsFetching = false;
    this._dataFetcherPromise = null;
    this._dataErrorCount = 0;
    this._dataDelay = 0;

    this._inconclusiveLastErrorTime = null;
    this._inconclusiveBackoffErrorCount = 0;
    this._inconclusiveNextAllowedFetchTime = moment();

    this.startFetchingData()
  }

  getDataFetchingStatus() {
    return {
      isFetching: this._dataIsFetching,
      errorCount: this._dataErrorCount,
      delay: this._dataDelay
    };
  }

  startFetchingData() {
    this._dataIsFetching = true;

    fetchData(this.cache, this.apiKey, this.lists)
      .then(function(delayInSecs) {
        this._dataDelay = delayInSecs * 1000;
        this._dataErrorCount = 0;
      }.bind(this))
      .catch(function(e) {
        this._dataErrorCount++;
        this._dataDelay = getDataDelayForErrorCount(this._dataErrorCount);
      }.bind(this))
      .then(function() {
        if (this._dataIsFetching) {
          setTimeout(() => this.startFetchingData(), this._dataDelay);
        }
      }.bind(this));
  }

  stopFetchingData() {
    this._dataIsFetching = false;
  }

  getInconclusiveFetchingStatus() {
    return {
      lastErrorTime: this._inconclusiveLastErrorTime,
      backoffErrorCount: this._inconclusiveBackoffErrorCount,
      nextAllowedFetchTime: this._inconclusiveNextAllowedFetchTime
    };
  }

  fetchInconclusive(prefixes) {
    return Promise.settle(prefixes.map(
      (prefix) => this.fetchInconclusivePrefix(prefix)
    ));
  }

  fetchInconclusivePrefix(prefix) {
    if (moment().isBefore(this._inconclusiveNextAllowedFetchTime)) {
      return Promise.reject('RATE_LIMIT');
    }

    var self = this;
    return fetchFullHashes(this.cache, this.apiKey, prefix)
      .then(function() {
        self._inconclusiveBackoffErrorCount = 0;
        self._inconclusiveNextAllowedFetchTime = moment();
      })
      .catch(function() {
        var errorTime = moment();

        // Conditions when we exit backoff mode or avoid going into it.
        if (!lastErrorTime || 
            lastErrorTime.isBefore(moment().subtract(8, 'hours'))) {
          this._inconclusiveLastErrorTime = errorTime;
          this._inconclusiveBackoffErrorCount = 0;
          this._inconclusiveNextAllowedFetchTime = moment();
          return;
        }

        // Backoff mode.
        var lastErrorTime = this._inconclusiveLastErrorTime;
        var backoffErrorCount = this._inconclusiveBackoffErrorCount;
        var nextAllowedFetchTime;

        if (backoffErrorCount === 0 &&
            lastErrorTime.isAfter(moment().subtract(5, 'minutes'))) {
          nextAllowedFetchTime = moment().add(30, 'minutes');
        } else if (backoffErrorCount === 1) {
          nextAllowedFetchTime = moment().add(1, 'hours');
        } else {
          nextAllowedFetchTime = moment().add(2, 'hours');
        }

        this._inconclusiveLastErrorTime = errorTime;
        this._inconclusiveBackoffErrorCount++;
        this._inconclusiveNextAllowedFetchTime = nextAllowedFetchTime;
      });
  }
}

module.exports = Fetcher;
