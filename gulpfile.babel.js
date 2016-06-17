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
const gulpIstanbul = require('gulp-istanbul');
const isparta = require('isparta');
const sourcemaps = require('gulp-sourcemaps');
const remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

gulp.task('clean', () => {
  return gulp.src(['lib', 'dist', 'coverage'], { read: false })
    .pipe(clean());
});

gulp.task('babel', ['clean'], () => {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'));
});

gulp.task('compile_web', ['babel'], () => {
  return gulp.src('lib/web/index.js')
    .pipe(gulpWebpack(webpackConfig))
    .pipe(gulp.dest('dist/web'));
});

gulp.task('uglify', ['webpack'], () => {
  return gulp.src('dist/web/pubnub.js')
    .pipe(uglify({ mangle: true, compress: true }))
    .pipe(rename('pubnub.min.js'))
    .pipe(gulp.dest('dist/web'));
});

gulp.task('lint_code', ['webpack'], () => {
  return gulp.src(['src/**/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('lint_tests', ['webpack'], () => {
  return gulp.src(['test/**/*.js'])
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

gulp.task('pre-test', () => {
  return gulp.src(['lib/**/*.js'])
    .pipe(gulpIstanbul({ instrumenter: isparta.Instrumenter }))
    .pipe(gulpIstanbul.hookRequire());
});

gulp.task('test_release', () => {
  return gulp.src('test/release/**/*.test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('test_server', () => {
  return gulp.src('test/**/*.test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }))
    .pipe(gulpIstanbul.writeReports({ reporters: ['json'] }));
});

gulp.task('remap_istanbul', () => {
  return gulp.src('./coverage/coverage-final.json')
      .pipe(remapIstanbul({
        reports: {
          json: './coverage/coverage-final.json',
          html: './coverage/html-report',
          text: null,
        }
      }));
});

gulp.task('webpack', ['compile_web']);
gulp.task('compile', ['clean', 'babel', 'webpack', 'uglify']);

gulp.task('lint', ['lint_code', 'lint_tests']);

gulp.task('validate', ['lint', 'flow']);
gulp.task('test_client', (done) => {
  runSequence('karma_client_full', 'karma_client_min', done);
});

gulp.task('test', (done) => {
  runSequence('pre-test', 'test_server', 'test_release', 'remap_istanbul', 'lint', 'flow', done);
});
