var path = require('path');
var gulp = require('gulp');
var jstransform = require('gulp-jstransform');
var nearley = require('./gulp/gulpNearley');
var mocha = require('gulp-mocha');

gulp.task('build-js', function() {
  return gulp.src('src/**/*.js')
    .pipe(jstransform())
    .pipe(gulp.dest('lib'));
});

gulp.task('build-proto', function() {
  return gulp.src('src/**/*.proto')
    .pipe(gulp.dest('lib'));
});

gulp.task('build-ne', function() {
  return gulp.src('src/**/*.ne', {buffer: false})
    .pipe(nearley())
    .pipe(gulp.dest('lib'));
})

gulp.task('build', ['build-js', 'build-proto', 'build-ne']);

gulp.task('test', ['build'], function(done) {
  return gulp.src('lib/**/__tests__/*.js', {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['test']);
});

gulp.task('default', ['build']);
