var StringCursor = require('../StringCursor');

var expect = require('expect');

describe('StringCursor', function () {
  describe('chomp', function() {
    it('should return empty on empty', function() {
      expect(new StringCursor('').chomp(5)).toBe('');
    });

    it('should return sections with no gap', function() {
      var cursor = new StringCursor('dsfa:sadfggdfsg:');
      expect(cursor.chomp(5)).toBe('dsfa:');
      expect(cursor.chomp(5)).toBe('sadfg');
      expect(cursor.chomp(5)).toBe('gdfsg');
      expect(cursor.chomp(5)).toBe(':');
    });
  });
    
  describe('chompUntil', function() {
    it('should return empty on empty', function() {
      expect(new StringCursor('').chompUntil(':')).toBe('');
    });

    it('should return sections between delim', function() {
      var cursor = new StringCursor('dsfa:sadfggdfsg:');
      expect(cursor.chompUntil(':')).toBe('dsfa');
      expect(cursor.chompUntil(':')).toBe('sadfggdfsg');
      expect(cursor.chompUntil(':')).toBe('');
    })
  });

  describe('chompWhile', function() {
    it('should return empty on empty', function() {
      expect(new StringCursor('').chompWhile(/[0-9]/)).toBe('');
    });

    it('should return sections with no gap', function() {
      var cursor = new StringCursor('dsfa:sadfggdfsg:');
      expect(cursor.chompWhile(/[a-z]/)).toBe('dsfa');
      expect(cursor.chompWhile(/[a-z]/)).toBe('');
      expect(cursor.chompRemaining()).toBe(':sadfggdfsg:');
    });
  });

  describe('chompRemaining', function() {
    it('should return empty on empty', function() {
      expect(new StringCursor('').chompRemaining()).toBe('');
    });

    it('should return remainder chomped', function() {
      var cursor = new StringCursor('dsfa:sadfggdfsg:');
      expect(cursor.chomp(5)).toBe('dsfa:');
      expect(cursor.chomp(5)).toBe('sadfg');
      expect(cursor.chompRemaining()).toBe('gdfsg:');
    });
  });
});
