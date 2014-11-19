var Safebrowsing = {
  Matcher: require('./match/Matcher'),
  Fetcher: require('./fetch/Fetcher'),
  RedisCache: require('./cache/RedisCache')
};

module.exports = Safebrowsing;