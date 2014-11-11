var _ = require('lodash');

function getFormattedNumericRangeList(ids) {
  var ranges = _.reduce(ids, function(list, item) {
    if (_.isEmpty(list)) {
      return [item];
    }

    var last = _.last(list);
    var initial = _.initial(list);

    if (_.isNumber(last) && last + 1 == item) {
      return initial.concat([[last, item]]);
    } else if (_.isArray(last) && last[1] + 1 == item) {
      return initial.concat([[last[0], item]]);
    }
    
    return list.concat(item);
  }, []);

  return _.map(ranges, function(rangeOrNumber) {
    if (_.isArray(rangeOrNumber)) {
      return rangeOrNumber.join('-')
    } else {
      return rangeOrNumber;
    }
  }).join(',')
}

function getPrefixRequestBody(lists, optSize) {
  var body = [];

  if (optSize) {
    body.push(`s;${optSize}`);
  }

  _.forOwn(lists, function(value, key) {
    var chunkTypes = [];

    if (value.add) {
      chunkTypes.push('a');
      chunkTypes.push(getFormattedNumericRangeList(value.add));
    }

    if (value.sub) {
      chunkTypes.push('s');
      chunkTypes.push(getFormattedNumericRangeList(value.sub));
    }

    body.push([key, chunkTypes.join(':')].join(';'));
  });

  return body.join('\n');
}

module.exports = getPrefixRequestBody;