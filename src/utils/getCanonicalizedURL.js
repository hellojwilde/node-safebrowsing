var URL = require('url');

var PERCENT_ESCAPE = /%([A-Fa-f0-9]{2})/g;

function hasPercentEscape(url) {
  return PERCENT_ESCAPE.test(url);
}

function getDecodedURI(uri) {
  return uri.replace(PERCENT_ESCAPE, function(match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  });
}

function getEntirelyDecodedURI(uri) {
  while(hasPercentEscape(uri)) {
    uri = getDecodedURI(uri);
  }
  return uri;
}

function getCanonicalizedHostname(hostname) {
  return hostname
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .replace(/\.+/, '.');
}

function getCanonicalizedPathname(pathname) {
  return '/' + (
    pathname
      .split('/')
      .reduce(function(segments, segment) {
        if (!segment || segment === '.') {
          return segments;
        } else if (segment === '..') {
          return segments.slice(0, -1);
        } else {
          return segments.concat(segment);
        }
      }, [])
      .join('/')
  );
}

function getCanonicalizedURL(url) {
  // 1. Remove tab, CR, and LF characters from the url.
  url = url.replace(/[\t\r\n]/g, '');

  // 2. Make the URL valid according to RFC 2396.
  var parsedUrl = URL.parse(url);
  if (!parsedUrl.protocol) {
    parsedUrl = URL.parse('http://' + url);
  }

  // 3. If the url ends in a fragment, remove the fragment.
  parsedUrl.hash = null;
  url = URL.format(parsedUrl);

  // 4. Remove all percent escapes from the URL.
  url = getEntirelyDecodedURI(url);

  // 5. Canonicalize the hostname and path separately.
  parsedUrl = URL.parse(url);

  var formatted = {
    protocol: parsedUrl.protocol,
    slashes: true,
    hostname: getCanonicalizedHostname(parsedUrl.hostname),
    port: parsedUrl.port,
    pathname: getCanonicalizedPathname(parsedUrl.pathname),
    search: parsedUrl.search
  };

  return encodeURI(URL.format(formatted));
}

module.exports = getCanonicalizedURL;