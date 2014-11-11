//
// Based on:
// 
//   https://github.com/wearefractal/gulp-coffee/blob/master/index.js
//   MIT License, Copyright 2013 Fractal.
//    
//   https://github.com/Hardmath123/nearley/blob/master/bin/nearleyc.js
//   MIT License, Copyright 2014 Hardmath123 and contributors.
//   

var NearleyGrammar = require('nearley/lib/nearley-language-bootstrapped.js');
var NearleyParser = require('nearley').Parser;
var PluginError = require('gulp-util').PluginError;
var StreamWrapper = require('nearley/lib/stream.js');

var gutil = require('gulp-util');
var merge = require('merge');
var nearleyCompile = require('nearley/lib/compile');
var nearleyGenerate = require('nearley/lib/generate');
var through = require('through2');

function gulpNearley(opt) {
  function transform(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isBuffer()) {
      return cb(new PluginError('gulp-nearley', 'Buffers not supported'));
    }

    var str = file.contents.toString('utf8');
    var dest = gutil.replaceExtension(file.path, '.js');
    var options = merge({
      export: 'grammar'
    }, opt);
    var parser = new NearleyParser(
      NearleyGrammar.ParserRules, 
      NearleyGrammar.ParserStart
    );

    file.contents.pipe(new StreamWrapper(parser))
      .on('finish', function() {
        file.contents = new Buffer(nearleyGenerate(
          nearleyCompile(parser.results[0], options), 
          options.export
        ));
        file.path = dest;
        cb(null, file);
      });
  }

  return through.obj(transform);
}

module.exports = gulpNearley;
