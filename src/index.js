var Safebrowsing = {
  fetchData: require('./fetchData'),
  fetchFullHashes: require('./fetchFullHashes'),
  RedisCache: require('./cache/RedisCache')
};

module.exports = Safebrowsing;