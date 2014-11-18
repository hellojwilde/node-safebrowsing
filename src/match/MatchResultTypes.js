var keyMirror = require('keymirror');

var MatchResultTypes = keyMirror({
  NO_MATCH: null,
  INCONCLUSIVE: null,
  MATCH: null
});

module.exports = MatchResultTypes;