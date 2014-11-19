var DefaultLists = require('../list/DefaultLists');

var _ = require('lodash');
var assert = require('assert');
var fetchData = require('./fetchData');
var fetchFullHashes = require('./fetchFullHashes');
var moment = require('moment');

function getDataDelayForErrorCount(errorCount) {
  assert(errorCount > 0);

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

    this._dataFetcherPromise = null;
    this._dataErrorCount = 0;
    this._dataDelay = 0;

    this._inconclusiveLastErrorTime = null;
    this._inconclusiveBackoffErrorCount = 0;
    this._inconclusiveNextAllowedFetchTime = moment();

    this.startFetchingData();
  }

  getDataFetchingStatus() {
    return {
      errorCount: this._dataErrorCount,
      delay: this._dataDelay
    };
  }

  startFetchingData() {
    var self = this;

    this._dataFetcherPromise = Promise.coroutine(function*() {
      var delayInSecs;

      while(1) {
        try {
          delayInSecs = yield fetchData(self.cache, self.apiKey, self.lists);

          self._dataDelay = delayInSecs * 1000;
          self._dataErrorCount = 0;
        } catch(e) {
          self._dataErrorCount++;
          self._dataDelay = getDataDelayForErrorCount(self._dataErrorCount);
        }

        yield Promise.delay(self._dataDelay * 1000);
      }
    }).cancellable();

    return this._dataFetcherPromise;
  }

  stopFetchingData() {
    return this._dataFetcherPromise.cancel('STOP');
  }

  getInconclusiveFetchingStatus() {
    return {
      lastErrorTime: this._inconclusiveLastErrorTime,
      inBackoffMode: this._inconclusiveInBackoffMode,
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
