var gulp = require('gulp');
var regenerator = require('gulp-regenerator');
var jstransform = require('gulp-jstransform');
var jest = require('gulp-jest');

gulp.task('build', function() {
  gulp.src('src/**/*.js')
    .pipe(regenerator())
    .pipe(jstransform())
    .pipe(gulp.dest('lib'));
});

gulp.task('test', ['build'], function() {
  gulp.src('lib/**/__tests__')
    .pipe(jest())
});

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['test']);
});

gulp.task('default', ['build']);
