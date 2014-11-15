var expect = require('expect');
var getCanonicalizedURI = require('../getCanonicalizedURL');

describe.only('getCanonicalizedURI', function() {
  var testCases = [
    // {from: "http://☃-⌘.com", to: "http://xn----dqo34k.com/"},
    {from: "http://host/%25%32%35", to: "http://host/%25"},
    {from: "http://host/%25%32%35%25%32%35", to: "http://host/%25%25"},
    {from: "http://host/%2525252525252525", to: "http://host/%25"},
    {from: "http://host/asdf%25%32%35asd", to: "http://host/asdf%25asd"},
    {from: "http://host/%%%25%32%35asd%%", to: "http://host/%25%25%25asd%25%25"},
    {from: "http://www.google.com/", to: "http://www.google.com/"},
    {from: "http://%31%36%38%2e%31%38%38%2e%39%39%2e%32%36/%2E%73%65%63%75%72%65/%77%77%77%2E%65%62%61%79%2E%63%6F%6D/", to: "http://168.188.99.26/.secure/www.ebay.com/"},
    {from: "http://195.127.0.11/uploads/%20%20%20%20/.verify/.eBaysecure=updateuserdataxplimnbqmn-xplmvalidateinfoswqpcmlx=hgplmcx/", to: "http://195.127.0.11/uploads/%20%20%20%20/.verify/.eBaysecure=updateuserdataxplimnbqmn-xplmvalidateinfoswqpcmlx=hgplmcx/"},
    {from: "http://host%23.com/%257Ea%2521b%2540c%2523d%2524e%25f%255E00%252611%252A22%252833%252944_55%252B", to: "http://host%23.com/~a!b@c%23d$e%25f^00&11*22(33)44_55+"},
    // // {from: "http://3279880203/blah", to: "http://195.127.0.11/blah"},
    {from: "http://www.google.com/blah/..", to: "http://www.google.com/"},
    {from: "www.google.com/", to: "http://www.google.com/"},
    {from: "www.google.com", to: "http://www.google.com/"},
    {from: "http://www.evil.com/blah#frag", to: "http://www.evil.com/blah"},
    {from: "http://www.GOOgle.com/", to: "http://www.google.com/"},
    {from: "http://www.google.com.../", to: "http://www.google.com/"},
    {from: "http://www.google.com/foo\tbar\rbaz\n2", to: "http://www.google.com/foobarbaz2"},
    {from: "http://www.google.com/q?", to: "http://www.google.com/q?"},
    {from: "http://www.google.com/q?r?", to: "http://www.google.com/q?r?"},
    {from: "http://www.google.com/q?r?s", to: "http://www.google.com/q?r?s"},
    {from: "http://evil.com/foo#bar#baz", to: "http://evil.com/foo"},
    {from: "http://evil.com/foo;", to: "http://evil.com/foo;"},
    {from: "http://evil.com/foo?bar;", to: "http://evil.com/foo?bar;"},
    {from: "http://\x01\x80.com/", to: "http://%01%80.com/"},
    {from: "http://notrailingslash.com", to: "http://notrailingslash.com/"},
    {from: "http://www.gotaport.com:1234/", to: "http://www.gotaport.com:1234/"},
    {from: "  http://www.google.com/  ", to: "http://www.google.com/"},
    {from: "http:// leadingspace.com/", to: "http://%20leadingspace.com/"},
    {from: "http://%20leadingspace.com/", to: "http://%20leadingspace.com/"},
    {from: "%20leadingspace.com/", to: "http://%20leadingspace.com/"},
    {from: "https://www.securesite.com/", to: "https://www.securesite.com/"},
    {from: "http://host.com/ab%23cd", to: "http://host.com/ab%23cd"},
    {from: "http://host.com//twoslashes?more//slashes", to: "http://host.com/twoslashes?more//slashes"}
  ];
  
  testCases.forEach(function(testCase) {
    var testCaseName = 'converts {from} -> {to}'
      .replace('{from}', testCase.from)
      .replace('{to}', testCase.to);

    it(testCaseName, function () {
      expect(getCanonicalizedURI(testCase.from)).toBe(testCase.to);
    });
  });
});
