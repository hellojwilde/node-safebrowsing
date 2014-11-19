var GoogleMalwareList = require('./GoogleMalwareList');
var GooglePhishingList = require('./GooglePhishingList');

var DefaultLists = [
  GoogleMalwareList,
  GooglePhishingList
];

module.exports = DefaultLists;