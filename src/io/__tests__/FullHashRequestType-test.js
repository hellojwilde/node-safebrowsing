var FullHashRequestType = require('../FullHashRequestType');

var expect = require('expect');

describe('FullHashRequestType', function() {
  describe('getRequestURL', function() {
    it('should work with the Google example', function() {
      expect(FullHashRequestType.getRequestURL({
        apiKey: '12345',
        clientVersion: '1.5.2'
      })).toBe(
        'https://safebrowsing.google.com/safebrowsing/gethash' +
        '?client=api&key=12345&appver=1.5.2&pver=3.0'
      );
    });
  });

  describe('getRequestBody', function() {
    it('should work with a fairly contrived example', function() {
      expect(FullHashRequestType.getRequestBody({
        prefixSize: 4,
        prefixes: ['abcd', 'defg', 'jklh', 'dsfa']
      })).toBe(
        '4:16\n' +
        'abcddefgjklhdsfa'
      );
    });
  });

  describe('parseResponseBody', function() {
    it('should work with the single list Google example', function() {
      expect(FullHashRequestType.parseResponseBody(
        '600\n'+
        'googpub-phish-shavar:32:1\n' +
        '01234567890123456789012345678901'
      )).toEqual({
        delay: 600,
        lists: {
          'googpub-phish-shavar': [
            {
              hash: '01234567890123456789012345678901',
              metadata: null
            }
          ]
        }
      })
    });

    it('should work with the multi list, metadata Google example', function() {
      expect(FullHashRequestType.parseResponseBody(
        '900\n' + 
        'goog-malware-shavar:32:2:m\n' + 
        '01234567890123456789012345678901987654321098765432109876543210982\n' + 
        'AA3\n' + 
        'BBBgoogpub-phish-shavar:32:1\n' + 
        '01234567890123456789012345678901'
      )).toEqual({
        delay: 900,
        lists: {
          'goog-malware-shavar': [
            {
              hash: '01234567890123456789012345678901',
              metadata: 'AA'
            },
            {
              hash: '98765432109876543210987654321098',
              metadata: 'BBB'
            }
          ],
          'googpub-phish-shavar': [
            {
              hash: '01234567890123456789012345678901',
              metadata: null
            }
          ]
        }
      });
    });

    it('should work with empty response', function() {
      expect(FullHashRequestType.parseResponseBody('900')).toEqual({
        delay: 900,
        lists: {}
      })
    });
  });
});
