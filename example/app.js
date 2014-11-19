var Redis = require('redis');
var Safebrowsing = require('../lib/index.js');

var express = require('express');
var bodyParser = require('body-parser');

// There's two core pieces of configuration information:
// 
//   - The API key for accessing the Google Safebrowsing API.
//   - The cache wrapper and connection to appropriate back-end data store.
//     The cache object is intended to be stateless (in that it acts as a 
//     transparent relay to the backend store), so we can re-use it across
//     multiple Fetchers and Matchers.

var API_KEY = '<safebrowsing api key>';
var cache = new Safebrowsing.RedisCache(new Redis.createClient());

// # Class: Fetcher
// 
// A Fetcher is an object that manages updating our copy of the cache.
// Only create **one instance** of this in your entire application.
// It automatically fetches new prefix data from the API at regular intervals
// from [GoogleMalwareList, GooglePhishingList].
// 
// ## Wait, why no parallelism?
// 
// Since the Safebrowsing API doesn't allow parallel downloads, there's no
// advantage to trying to make this parallel. It also simplfies the cache
// design if this is the only system that can fetch and mutate the cache.
// 
// If you're building a real-world application you're going to want to probably
// slap this behind a thrift service or some other system that lets you access
// it from multiple separate boxes.

var fetcher = new Safebrowsing.Fetcher(cache, API_KEY);

// # Class: Matcher
// 
// A Matcher is an object that manages checking if URLs are blacklisted.
// It does not mutate the cache, so you can create as many Matchers as you want.

var matcher = new Safebrowsing.Matcher(cache);

// # Checking URLs
// 
// Suppose we want to create a web service endpoint that checks URLs.
// We're going to create a POST endpoint that you can call and then it'll 
// give you back information on whether the list was found in any blacklists.

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  res.render('index');
});

app.post('/', function(req, res) {
  var url = req.body.url;

  // We can check whether something is in our cached set of list data with
  // Matcher.match. It checks the lists [GoogleMalwareList, GooglePhishingList].
  // 
  // There's three states a list match could be in:
  // 
  //  - No match:     Not found on the prefix list. **It's clean.**
  //  - Inconclusive: Found on the prefix list, but don't have prefix details
  //                  to match against, and thus can't show a warning yet.
  //                  We'll need to do a detail fetch first.
  //  - Match:        Found on the prefix list and the prefix detail list.
  //                  **We should show a warning.**
  
  var matches = matcher.match(url);

  // ## Class: MatchResults
  // 
  // It returns a MatchResults object, that lets you easily filter the matching
  // results futher for use in a UI or to do detail fetches.
  // 
  // ### No Match Filtering
  // 
  //  - `results.getNoMatch()` Returns a list of the list non-matches.
  // 
  // ### Match Filtering
  // 
  //  - `results.getMatch()` Returns a list of the list matches and metadata.
  //  
  // ### Inconclusive Filtering
  // 
  //  - `results.getInconclusive()` Returns a list of the inconclusive results.
  //  - `results.getInconclusiveRequest()` Returns an object you can pass to 
  //    Fetcher.fetchInconclusive to get details.
  //  - `results.resolveInconclusive()` Provided that fetchInconclusive has 
  //    completed, you can call this to rematch the inconclusive lists with a 
  //    promise for new, updated (not mutated) MatchResults.

  matches
    .then(function(results) {
      if (results.getInconclusive().length > 0) {
        return fetcher.fetchInconclusive(results.getInconclusiveRequest())
          .then(function() { return results.resolveInconclusive(); });
      }
      return results;
    })
    .then(function(results) {
      res.json({
        url: url,
        results: results.getMatch()
      });
    });
});

var server = app.listen(3001, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

module.exports = app;
