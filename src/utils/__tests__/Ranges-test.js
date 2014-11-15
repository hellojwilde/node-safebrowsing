var Ranges = require('../Ranges');

var expect = require('expect');

describe('Ranges', function() {
  describe('getRangesForNumbers', function() {
    it('should return [] for []', function() {
      expect(Ranges.getRangesForNumbers([])).toEqual([]);
    });

    it('should return ranges for numbers, inclusive', function() {
      expect(Ranges.getRangesForNumbers([1,2,3,4,7,9,10]))
        .toEqual([[1,4],7,[9,10]]);
    })
  });

  describe('getNumbersForRanges', function() {
    it('should return [] for []', function() {
      expect(Ranges.getNumbersForRanges([])).toEqual([]);
    });

    it('should return numbers for ranges, inclusive', function() {
      expect(Ranges.getNumbersForRanges([[1,4],7,[9,10]]))
        .toEqual([1,2,3,4,7,9,10]);
    })
  });

  describe('formatRanges', function() {
    it('should return "" for []', function() {
      expect(Ranges.formatRanges([])).toEqual('');
    });

    it('should return numbers for [...numbers...]', function() {
      expect(Ranges.formatRanges([1,3,34,45])).toEqual('1,3,34,45');
      expect(Ranges.formatRanges([1])).toEqual('1');
      expect(Ranges.formatRanges([14455])).toEqual('14455');
    });

    it('should return ranges for [...ranges...]', function() {
      expect(Ranges.formatRanges([[1,3],[4,5],7])).toEqual('1-3,4-5,7');
    });
  });

  describe('parseRanges', function() {
    it('should return [] for empty ranges', function() {
      expect(Ranges.parseRanges('')).toEqual([]);
    });

    it('should parse a set of numbers', function() {
      expect(Ranges.parseRanges('1,3,34,45')).toEqual([1,3,34,45]);
      expect(Ranges.parseRanges('1')).toEqual([1]);
      expect(Ranges.parseRanges('14455')).toEqual([14455]);
    });

    it('should parse ranges', function() {
      expect(Ranges.parseRanges('1-3,4-5,7')).toEqual([[1,3],[4,5],7]);
    });
  });
});