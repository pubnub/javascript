/* eslint no-console: 0, arrow-body-style: 0 */

const gulp = require('gulp');
const path = require('path');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const gulpWebpack = require('webpack-stream');
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
const packageJSON = require('./package.json');
const gzip = require('gulp-gzip');
const unzip = require('gulp-unzip');

gulp.task('clean', () => {
  return gulp.src(['lib', 'dist', 'coverage', 'upload'], { read: false })
    .pipe(clean());
});

gulp.task('babel', () => {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'));
});

gulp.task('unzip_titanium_sdk', () => {
  return gulp.src('resources/titanium.zip')
    .pipe(unzip())
    .pipe(gulp.dest('resources/'));
});

gulp.task('compile_web', () => {
  return gulp.src('src/web/index.js')
    .pipe(gulpWebpack(webpackConfig))
    .pipe(gulp.dest('dist/web'));
});

gulp.task('compile_titanium', () => {
  return gulp.src('src/titanium/index.js')
    .pipe(gulpWebpack(webpackConfig))
    .pipe(gulp.dest('dist/titanium'));
});

gulp.task('create_version', () => {
  return gulp.src('dist/web/pubnub.js')
    .pipe(rename(`pubnub.${packageJSON.version}.js`))
    .pipe(gulp.dest('upload/normal'));
});

gulp.task('create_version_gzip', () => {
  return gulp.src('upload/normal/*.js')
    .pipe(gzip({ append: false }))
    .pipe(gulp.dest('upload/gzip'));
});

gulp.task('uglify_web', () => {
  return gulp.src('dist/web/pubnub.js')
    .pipe(uglify({ mangle: true, compress: true }))

    .pipe(rename('pubnub.min.js'))
    .pipe(gulp.dest('dist/web'))

    .pipe(rename(`pubnub.${packageJSON.version}.min.js`))
    .pipe(gulp.dest('upload/normal'));
});

gulp.task('uglify_titanium', () => {
  return gulp.src('dist/titanium/pubnub.js')
    .pipe(uglify({ mangle: true, compress: true }))
    .pipe(rename('pubnub.min.js'))
    .pipe(gulp.dest('dist/titanium'));
});

gulp.task('lint_code', [], () => {
  return gulp.src(['src/**/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('lint_tests', [], () => {
  return gulp.src(['test/**/*.js', '!test/dist/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint_code', 'lint_tests']);

gulp.task('flow', (cb) => {
  return exec('./node_modules/.bin/flow --show-all-errors', (err, stdout, stderr) => {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('validate', ['lint', 'flow']);

gulp.task('pre-test', () => {
  return gulp.src(['src/**/*.js'])
    .pipe(gulpIstanbul({ instrumenter: isparta.Instrumenter, includeAllSources: true }))
    .pipe(gulpIstanbul.hookRequire());
});

gulp.task('test_web', (done) => {
  new Karma({
    configFile: path.join(__dirname, '/karma/web.config.js'),
  }, done).start();
});

gulp.task('test_node', () => {
  return gulp.src(['test/**/*.test.js', '!test/dist/*.js'], { read: false })
    .pipe(mocha({ reporter: 'spec' }))
    .pipe(gulpIstanbul.writeReports({ reporters: ['json', 'lcov', 'text'] }));
});

gulp.task('test_titanium', ['unzip_titanium_sdk'], (done) => {
  new Karma({
    configFile: path.join(__dirname, '/karma/titanium.config.js'),
  }, done).start();
});

gulp.task('test_react-native', () => {
  return gulp.src('test/dist/react-native.test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }))
    .pipe(gulpIstanbul.writeReports({ reporters: ['json', 'lcov', 'text'] }));
});

gulp.task('test_release', () => {
  return gulp.src('test/release/**/*.test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('test', (done) => {
  runSequence('pre-test', 'test_node', 'test_web', 'test_titanium', 'test_react-native', 'test_release', 'validate', () => {
    process.exit();
  });
});

gulp.task('webpack', (done) => {
  runSequence('compile_web', 'compile_titanium', done);
});

gulp.task('compile', (done) => {
  runSequence('clean', 'babel', 'webpack', 'uglify_web', 'uglify_titanium', 'create_version', 'create_version_gzip', done);
});
