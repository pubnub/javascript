/* eslint no-console: 0, arrow-body-style: 0 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const gulpWebpack = require('gulp-webpack');
const webpackConfig = require('./webpack.config');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const exec = require('child_process').exec;
const Karma = require('karma').Server;
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');

gulp.task('clean', () => {
  return gulp.src(['lib/', 'dist'], { read: false })
    .pipe(clean());
});

gulp.task('babel', ['clean'], () => {
  return gulp.src('src/**/*.js').pipe(babel()).pipe(gulp.dest('lib'));
});

gulp.task('compile_web', ['babel'], () => {
  return gulp.src('lib/web/platform.js')
    .pipe(gulpWebpack(webpackConfig))
    .pipe(gulp.dest('dist/web'));
});

gulp.task('uglify', ['webpack'], () => {
  return gulp.src('dist/web/pubnub.js')
    .pipe(uglify({ mangle: true, compress: true }))
    .pipe(rename('pubnub.min.js'))
    .pipe(gulp.dest('dist/web'));
});

gulp.task('lint', ['webpack'], () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js', '!test/server/monolith.test.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('flow', (cb) => {
  return exec('./node_modules/.bin/flow --show-all-errors', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('karma_client_full', (done) => {
  new Karma({
    configFile: __dirname + '/test/karma.full.conf.js',
  }, done).start();
});

gulp.task('karma_client_min', (done) => {
  new Karma({
    configFile: __dirname + '/test/karma.min.conf.js',
  }, done).start();
});

gulp.task('test_release', () => {
  return gulp.src('test/release/**/*.test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('test_server', () => {
  return gulp.src('test/**/*.test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('webpack', ['compile_web']);
gulp.task('compile', ['clean', 'babel', 'webpack', 'uglify']);

gulp.task('validate', ['lint', 'flow']);
gulp.task('test_client', (done) => {
  return runSequence('karma_client_full', 'karma_client_min', done);
});
gulp.task('test', (done) => {
  return runSequence('test_server', 'test_release', done);
});
