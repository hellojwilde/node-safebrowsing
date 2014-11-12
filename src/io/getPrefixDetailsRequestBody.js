function getPrefixDetailsRequestBody(prefixSize, prefixes) {
  return [
    [prefixSize,prefixes.length * prefixSize].join(':'),
    prefixes.join('')
  ].join('\n');
}

module.exports = getPrefixDetailsRequestBody;