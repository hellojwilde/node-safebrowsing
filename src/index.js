var Safebrowsing = {
  fetchData: require('./fetchData'),
  fetchFullHashes: require('./fetchFullHashes'),
  RedisCache: require('./caches/RedisCache')
};

module.exports = Safebrowsing;