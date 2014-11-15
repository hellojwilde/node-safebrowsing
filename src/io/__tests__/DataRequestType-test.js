var DataRequestType = require('../DataRequestType');

var expect = require('expect');
var sendRequest = require('../sendRequest');
var _ = require('lodash');

describe('DataRequestType', function() {
  describe('getRequestURL', function() {
    it('should work with the Google example', function() {
      expect(DataRequestType.getRequestURL({
        apiKey: '12345',
        clientVersion: '1.5.2'
      })).toBe(
        'https://safebrowsing.google.com/safebrowsing/downloads' +
        '?client=api&key=12345&appver=1.5.2&pver=3.0'
      );
    });
  });

  describe('getRequestBody', function() {
    var lists = {
      'googpub-phish-shavar': {
        'add': [[1, 3], 5, 8],
        'sub': [[4, 5]]
      },
      'acme-white-shavar': {
        'add': [[1, 7]],
        'sub': [[1, 2]]
      }
    };

    it('should work without a size', function() {
      expect(DataRequestType.getRequestBody({
        lists: lists
      })).toBe(
        'googpub-phish-shavar;a:1-3,5,8:s:4-5\n' +
        'acme-white-shavar;a:1-7:s:1-2'
      );
    });

    it('should work with a size', function() {
      expect(DataRequestType.getRequestBody({
        lists: lists, 
        size: 200
      })).toBe(
        's;200\n' +
        'googpub-phish-shavar;a:1-3,5,8:s:4-5\n' +
        'acme-white-shavar;a:1-7:s:1-2'
      );
    });
  });

  describe('parseResponseBody', function() {
    it('should parse the Google example', function() {
      var rsp = (
        'n:1200\n' +
        'i:googpub-phish-shavar\n' +
        'u:cache.google.com/first_redirect_example\n' +
        'sd:1,2\n' +
        'i:acme-white-shavar\n' +
        'u:cache.google.com/second_redirect_example\n' +
        'ad:1-2,4-5,7\n' +
        'sd:2-6'
      );

      var expected = {
        'delay': 1200,
        'isReset': false,
        'lists': {
          'googpub-phish-shavar': {
            'urls': ['https://cache.google.com/first_redirect_example'],
            'expireAdd': [],
            'expireSub': [1, 2]
          },
          'acme-white-shavar': {
            'urls': ['https://cache.google.com/second_redirect_example'],
            'expireAdd': [[1,2], [4,5], 7],
            'expireSub': [[2, 6]]
          }
        }
      };

      expect(DataRequestType.parseResponseBody(rsp)).toEqual(expected);
    });

    it('should parse a multiline result', function() {
      var rsp = (
        'n:1691\n' +
        'i:goog-malware-shavar\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQg_8IGI7_CCABSgwIARDz-QgYgf8IIAE\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQzvcIGPL5CCABSgwIARCH9wgYzPcIIAFKDAgBEIX3CBiF9wggAUoMCAEQgPcIGIL3CCABSgwIARDt9ggY-_YIIAFKDAgBEPX1CBjr9gggAQ\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQrPUIGPT1CCABSgwIARCZ9QgYqvUIIAFKDAgBEJD1CBiX9QggAUoMCAEQh_UIGI71CCABSgwIARDe9AgYhPUIIAFKDAgBENj0CBjc9AggAUoMCAEQ1fQIGNb0CCABSgwIARCM9AgY0_QIIAFKDAgBEJ3zCBiK9AggAUoMCAEQ-_EIGJvzCCAB\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQ4fEIGPrxCCABSgwIARDO7wgY3_EIIAFKDAgBEJDuCBjM7wggAUoMCAEQ9e0IGI7uCCAB\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQ9ewIGPTtCCABSgwIARDe7AgY8-wIIAFKDAgBEOHrCBjc7AggAUoMCAEQhOsIGN_rCCABSgwIARD56ggYgusIIAFKDAgBEO7qCBj36gggAUoMCAEQ4uoIGOzqCCABSgwIARDG6ggY4OoIIAFKDAgBELfqCBjE6gggAQ\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQpOoIGLbqCCABSgwIARCR6ggYouoIIAFKDAgBENnpCBiP6gggAUoMCAEQyOkIGNfpCCABSgwIARDB6QgYw-kIIAE\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoQCAAQksIJGOfHCSABKgLeAg\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoSCAAQ9bwJGJHCCSABKgTEAaMD\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkocCAAQoLgJGPS8CSABKg5XWFpmhwG1AZgCsAOwBA\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkonCAAQybAJGJ-4CSABKhlqkAHPAdwB5gH-Af8B9ALtA8AF2QXhBacG\n' +
        'u:safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoqCAAQ0aoJGMiwCSABKhwFCBE4QWiIAdoB7wGUAqAD8AOEBIYEswT_BJ8F'
      );

      var expected = {
        delay: 1691,
        isReset: false,
        lists: {
          'goog-malware-shavar': {
            urls: [
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQg_8IGI7_CCABSgwIARDz-QgYgf8IIAE', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQzvcIGPL5CCABSgwIARCH9wgYzPcIIAFKDAgBEIX3CBiF9wggAUoMCAEQgPcIGIL3CCABSgwIARDt9ggY-_YIIAFKDAgBEPX1CBjr9gggAQ', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQrPUIGPT1CCABSgwIARCZ9QgYqvUIIAFKDAgBEJD1CBiX9QggAUoMCAEQh_UIGI71CCABSgwIARDe9AgYhPUIIAFKDAgBENj0CBjc9AggAUoMCAEQ1fQIGNb0CCABSgwIARCM9AgY0_QIIAFKDAgBEJ3zCBiK9AggAUoMCAEQ-_EIGJvzCCAB', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQ4fEIGPrxCCABSgwIARDO7wgY3_EIIAFKDAgBEJDuCBjM7wggAUoMCAEQ9e0IGI7uCCAB', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQ9ewIGPTtCCABSgwIARDe7AgY8-wIIAFKDAgBEOHrCBjc7AggAUoMCAEQhOsIGN_rCCABSgwIARD56ggYgusIIAFKDAgBEO7qCBj36gggAUoMCAEQ4uoIGOzqCCABSgwIARDG6ggY4OoIIAFKDAgBELfqCBjE6gggAQ', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoMCAEQpOoIGLbqCCABSgwIARCR6ggYouoIIAFKDAgBENnpCBiP6gggAUoMCAEQyOkIGNfpCCABSgwIARDB6QgYw-kIIAE', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoQCAAQksIJGOfHCSABKgLeAg', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoSCAAQ9bwJGJHCCSABKgTEAaMD', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkocCAAQoLgJGPS8CSABKg5XWFpmhwG1AZgCsAOwBA', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkonCAAQybAJGJ-4CSABKhlqkAHPAdwB5gH-Af8B9ALtA8AF2QXhBacG', 
              'https://safebrowsing-cache.google.com/safebrowsing/rd/ChNnb29nLW1hbHdhcmUtc2hhdmFyOAFAAkoqCAAQ0aoJGMiwCSABKhwFCBE4QWiIAdoB7wGUAqAD8AOEBIYEswT_BJ8F'
            ],
            expireAdd: [],
            expireSub: []
          }
        }
      };

      expect(DataRequestType.parseResponseBody(rsp)).toEqual(expected);
    });
  });
});