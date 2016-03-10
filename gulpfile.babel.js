/* eslint no-console: 0 */

const gulp = require('gulp');
const babel = require('gulp-babel');
const clean = require('gulp-clean');
const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const exec = require('child_process').exec;
const Karma = require('karma').Server;
const mocha = require('gulp-mocha');
const runSequence = require('run-sequence');

gulp.task('clean', function () {
  return gulp.src(['lib/', 'distributable'], { read: false })
    .pipe(clean());
});

gulp.task('babel', ['clean'], function () {
  return gulp.src('src/**/*.js').pipe(babel()).pipe(gulp.dest('lib'));
});

gulp.task('compile_web', ['babel'], function () {
  return gulp.src('lib/web/platform.js')
  .pipe(gulpWebpack({
    module: {
      loaders: [
        { test: /\.json/, loader: 'json' },
      ],
    },
    output: {
      filename: 'pubnub.js',
      library: 'PUBNUB',
      libraryTarget: 'umd',
    },
    plugins: [
      new webpack.BannerPlugin(require('./package.json').version + ' / Consumer ', {
        raw: false, entryOnly: true,
      }),
    ],
    externals: [],
  }))
  .pipe(gulp.dest('distributable/web'));
});

gulp.task('compile_titanium', ['babel'], function () {
  return gulp.src('lib/titanium/platform.js')
  .pipe(gulpWebpack({
    module: {
      loaders: [
        { test: /\.json/, loader: 'json' },
      ],
    },
    output: {
      filename: 'pubnub.js',
      library: 'PUBNUB',
      libraryTarget: 'umd',
    },
    plugins: [
      new webpack.BannerPlugin(require('./package.json').version + ' / Titanium', {
        raw: false, entryOnly: true,
      }),
    ],
    externals: [],
  }))
  .pipe(gulp.dest('distributable/titanium'));
});

gulp.task('compile_parse', ['babel'], function () {
  return gulp.src('lib/parse/platform.js')
  .pipe(gulpWebpack({
    module: {
      loaders: [
        { test: /\.json/, loader: 'json' },
      ],
    },
    output: {
      filename: 'pubnub.js',
      library: 'PUBNUB',
      libraryTarget: 'umd',
    },
    plugins: [
      new webpack.BannerPlugin(require('./package.json').version + ' / Parse', {
        raw: false, entryOnly: true,
      }),
    ],
    externals: [],
  }))
  .pipe(gulp.dest('distributable/parse'));
});

gulp.task('uglify', ['webpack'], function () {
  return gulp.src('distributable/web/pubnub.js')
    .pipe(uglify({ mangle: true, compress: true }))
    .pipe(rename('pubnub.min.css'))
    .pipe(gulp.dest('distributable/web'));
});

gulp.task('lint', ['webpack'], function () {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError());
});

gulp.task('flow', function (cb) {
  return exec('./node_modules/.bin/flow --show-all-errors', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('karma_client_full', function (done) {
  new Karma({
    configFile: __dirname + '/test/karma.conf.js',
  }, done).start();
});

gulp.task('karma_client_min', function (done) {
  new Karma({
    configFile: __dirname + '/test/karma.conf.js',
  }, done).start();
});

gulp.task('test_release', function () {
  return gulp.src('test/release/**/*.test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('test_server', function () {
  return gulp.src('test/server/**/*.test.js', { read: false })
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('webpack', ['compile_titanium', 'compile_web', 'compile_parse']);
gulp.task('compile', ['clean', 'babel', 'webpack', 'uglify']);

gulp.task('validate', ['lint', 'flow']);
gulp.task('test_client', (done) => {
  runSequence('karma_client_full', 'karma_client_min', done);
});
gulp.task('test', (done) => {
  runSequence('test_client', 'test_server', 'test_release', done);
});
