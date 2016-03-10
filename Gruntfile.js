/* eslint no-var: 0 */

var webpack = require('webpack');

var WEBPACKED_PLATFORMS = ['web', 'parse', 'titanium'];

function registerWebpackBuilding(grunt) {
  var compileTargets = ['clean:core', 'babel:core'];

  WEBPACKED_PLATFORMS.forEach(function (platform) {
    var actions = [];

    ['clean', 'webpack', 'uglify'].forEach(function (utility) {
      actions.push(utility + ':' + platform);
    });

    compileTargets.push('compile:' + platform);
    grunt.registerTask('compile:' + platform, actions);
  });

  compileTargets = compileTargets.concat('eslint', 'flow');

  grunt.registerTask('_compile', compileTargets);
}

function webpackCommonBuilder(folderName, baseFolder, externals) {
  return {
    entry: './' + baseFolder + '/lib/platform.js',
    module: {
      loaders: [
        { test: /\.json/, loader: 'json' },
      ],
    },
    output: {
      path: './' + folderName + '/dist',
      filename: 'pubnub.js',
      library: 'PUBNUB',
      libraryTarget: 'umd',
    },
    plugins: [
      new webpack.BannerPlugin(require('./package.json').version + ' / ' + folderName, {
        raw: false, entryOnly: true,
      }),
    ],
    externals: externals,
  };
}


function createCleanRules() {
  var preparedRules = {
    core: 'core/lib',
    coverage: 'coverage',
  };

  WEBPACKED_PLATFORMS.forEach(function (platform) {
    preparedRules[platform] = [platform + '/dist'];
  });

  return preparedRules;
}

function createUglifyRules() {
  var preparedRules = {
    options: {
      mangle: true,
      compress: true,
    },
  };

  WEBPACKED_PLATFORMS.forEach(function (platform) {
    preparedRules[platform] = {};
    preparedRules[platform].files = {};
    preparedRules[platform].files[platform + '/dist/pubnub.min.js'] = [platform + '/dist/pubnub.js'];
  });

  return preparedRules;
}

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // prepackaged rules
    clean: createCleanRules(),
    uglify: createUglifyRules(),
    webpack: {
      web: webpackCommonBuilder('web', 'web', []),
      parse: webpackCommonBuilder('parse', 'parse', ['crypto', 'buffer']),
      titanium: webpackCommonBuilder('titanium', 'titanium', []),
    },
    //

    env: {
      lockdown: {
        VCR_MODE: 'playback',
      },
      record: {
        VCR_MODE: 'cache',
      },
    },
    karma: {
      webFull: { configFile: 'web/tests/karma.conf.js' },
      webMin: { configFile: 'web/tests/karma.min.conf.js' },
    },
    mocha_istanbul: {
      coverage_integration: {
        src: 'test/server/integration/',
        options: {
          scriptPath: require.resolve('isparta/bin/isparta'),
          coverageFolder: 'coverage/integration',
          mask: '**/*.test.js',
          print: 'none',
        },
      },
      coverage_unit: {
        src: 'test/server/unit',
        options: {
          scriptPath: require.resolve('isparta/bin/isparta'),
          mochaOptions: ['--bail', '--require', 'babel-core/register'],
          coverageFolder: 'coverage/unit',
          mask: '**/*.test.js',
          print: 'none',
        },
      },
      coverage_release: {
        src: 'test/release',
        options: {
          scriptPath: require.resolve('isparta/bin/isparta'),
          mochaOptions: ['--bail', '--require', 'babel-core/register'],
          coverageFolder: 'coverage/release',
          mask: '**/*.test.js',
          print: 'none',
        },
      },
      old: {
        src: 'node.js/tests/legacy',
        options: {
          scriptPath: require.resolve('isparta/bin/isparta'),
          coverageFolder: 'coverage/old',
          mask: 'integration_test.js',
          print: 'none',
        },
      },
    },
    flow: {
      app: {
        src: '.',
        options: {
          background: false,
        },
      },
    },
    babel: {
      core: {
        files: [
          {
            expand: true,
            cwd: 'core/src/',
            src: ['**/*.js'],
            dest: 'core/lib/',
            ext: '.js',
          },
        ],
      },
    },
    eslint: {
      target: [
        'node.js/*.js',
        'node.js/lib/*.js',
        'parse/lib/**/*.js',
        'titanium/lib/**/*.js',
        'web/lib/**/*.js',
        'core/src/**/*.js',
        'test/**/*.js',
      ],
    },
  });


  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-flow');

  grunt.registerTask('lockdown', ['env:lockdown']);
  grunt.registerTask('record', ['env:record']);

  registerWebpackBuilding(grunt);

  grunt.registerTask('compile', ['_compile']); // mapping for visibility

  grunt.registerTask('test-old', ['mocha_istanbul:old']);
  grunt.registerTask('test-unit', ['mocha_istanbul:coverage_unit']);
  grunt.registerTask('test-integration', ['mocha_istanbul:coverage_integration']);
  grunt.registerTask('test-release', ['mocha_istanbul:coverage_release']);
  grunt.registerTask('test-client', ['karma']);

  grunt.registerTask('test', ['test-unit', 'test-integration', 'test-release', 'eslint']);
  grunt.registerTask('test-record', ['env:test_record', 'mocha_istanbul:coverage_integration']);
};
