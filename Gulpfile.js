var path = require('path');
var gulp = require('gulp');
var jstransform = require('gulp-jstransform');
var jest = require('jest-cli');

var PluginError = require('gulp-util').PluginError;

gulp.task('build', function() {
  gulp.src('src/**/*.js')
    .pipe(jstransform())
    .pipe(gulp.dest('lib'));

  gulp.src('src/**/*.proto')
    .pipe(gulp.dest('lib'));
});

gulp.task('test', ['build'], function(done) {
  jest.runCLI({}, path.join(__dirname, 'lib'), function(success) {
    // From https://github.com/Dakuan/gulp-jest/blob/master/index.js,
    // Licensed under http://opensource.org/licenses/MIT.
    if (!success) {
      done(new PluginError('jest', {message: 'Tests failed.'}))
    }
    done();
  });
});

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['test']);
});

gulp.task('default', ['build']);
