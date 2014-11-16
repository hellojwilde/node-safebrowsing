var path = require('path');
var gulp = require('gulp');
var jstransform = require('gulp-jstransform');
var regenerator = require('gulp-regenerator');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var instanbul = require('gulp-istanbul');
var coveralls = require('gulp-coveralls');

gulp.task('build-js', function() {
  return gulp.src('src/**/*.js')
    .pipe(jstransform())
    .pipe(regenerator())
    .pipe(gulp.dest('lib'));
});

gulp.task('build-proto', function() {
  return gulp.src('src/**/*.proto')
    .pipe(gulp.dest('lib'));
});

gulp.task('build', ['build-js', 'build-proto']);

gulp.task('test', ['build'], function(done) {
  gulp.src(['lib/**/*.js', '!lib/**/*-test.js'])
    .pipe(instanbul())
    .on('finish', function() {
      gulp.src('lib/**/__tests__/*.js', {read: false})
        .pipe(mocha({reporter: 'spec'}))
        .pipe(instanbul.writeReports())
        .on('end', done);
    });
});

gulp.task('submit-coverage', function() {
  gulp.src('coverage/lcov.info')
    .pipe(coveralls());
});

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['test']);
});

gulp.task('default', ['build']);
