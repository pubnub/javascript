var WEBPACKED_PLATFORMS = ['modern', 'webos', 'sencha', 'phonegap'];

function registerWebpackBuilding(grunt) {
  var compileTargets = [];

  WEBPACKED_PLATFORMS.forEach(function (platform) {
    var actions = [];

    ['clean', 'webpack', 'replace', 'uglify'].forEach(function (utility) {
      actions.push(utility + ':' + platform);
    });

    compileTargets.push('compile:' + platform);
    grunt.registerTask('compile:' + platform, actions);
  });

  grunt.registerTask('_compile', ['exec:make_clean', 'exec:make'].concat(compileTargets));
}

function webpackModernBuilder(folderName) {
  return {
    entry: './modern/lib/platform.js',
    module: {
      loaders: [
        { test: /\.json/, loader: 'json' }
      ]
    },
    output: {
      path: './' + folderName + '/dist',
      filename: 'pubnub.js',
      library: 'PUBNUB',
      libraryTarget: 'umd'
    }
  };
}

function createUglifyRules() {
  var preparedRules = {
    options: {
      mangle: true,
      compress: true
    }
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
    clean: {
      modern: ['modern/dist', 'modern/pubnub.js', 'modern/pubnub.min.js'],
      sencha: ['sencha/dist'],
      phonegap: ['phonegap/dist'],
      webos: ['webos/dist']
    },
    env: {
      lockdown: {
        VCR_MODE: 'playback'
      },
      record: {
        VCR_MODE: 'cache'
      }
    },
    exec: {
      make_clean: 'make clean',
      make: 'make'
    },
    karma: {
      webFull: { configFile: 'web/tests/karma.conf.js' },
      webMin: { configFile: 'web/tests/karma.min.conf.js' },
      modernFull: { configFile: 'modern/tests/karma.conf.js' },
      modernMin: { configFile: 'modern/tests/karma.min.conf.js' }
    },
    uglify: createUglifyRules(),
    mocha_istanbul: {
      coverage_integration: {
        src: 'test/server/integration/',
        options: {
          coverageFolder: 'coverage/integration',
          mask: '**/*.test.js',
          print: 'none'
        }
      },
      coverage_unit: {
        src: 'test/server/unit',
        options: {
          mochaOptions: ['--bail'],
          coverageFolder: 'coverage/unit',
          mask: '**/*.test.js',
          print: 'none'
        }
      },
      coverage_release: {
        src: 'test/release',
        options: {
          mochaOptions: ['--bail'],
          coverageFolder: 'coverage/release',
          mask: '**/*.test.js',
          print: 'none'
        }
      },
      old: {
        src: 'node.js/tests/legacy',
        options: {
          coverageFolder: 'coverage/old',
          mask: 'integration_test.js',
          print: 'none'
        }
      }
    },
    istanbul_check_coverage: {
      default: {
        options: {
          coverageFolder: 'coverage/**',
          check: {
          }
        }
      }
    },
    eslint: {
      target: [
        'node.js/*.js',
        'node.js/lib/*.js',
        'test/**/*.js',
        'modern/lib/**/*.js'
      ]
    },
    replace: {
      modern: {
        src: ['modern/dist/pubnub.js'],
        overwrite: true,
        replacements: [{
          from: /PLATFORM/g,
          to: '\'Modern\''
        }]
      },
      sencha: {
        src: ['sencha/dist/pubnub.js'],
        overwrite: true,
        replacements: [{
          from: /PLATFORM/g,
          to: '\'Sencha\''
        }]
      },
      phonegap: {
        src: ['phonegap/dist/pubnub.js'],
        overwrite: true,
        replacements: [{
          from: /PLATFORM/g,
          to: '\'Phonegap\''
        }]
      },
      webos: {
        src: ['webos/dist/pubnub.js'],
        overwrite: true,
        replacements: [{
          from: /PLATFORM/g,
          to: '\'Webos\''
        }]
      }
    },
    webpack: {
      modern: webpackModernBuilder('modern'),
      sencha: webpackModernBuilder('sencha'),
      phonegap: webpackModernBuilder('phonegap'),
      webos: webpackModernBuilder('webos')
    }
  });



  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('lockdown', ['env:lockdown']);
  grunt.registerTask('record', ['env:record']);

  registerWebpackBuilding(grunt);


  grunt.registerTask('compile', ['_compile']); // mapping for visbility

  grunt.registerTask('test-old', ['mocha_istanbul:old']);
  grunt.registerTask('test-unit', ['mocha_istanbul:coverage_unit']);
  grunt.registerTask('test-integration', ['mocha_istanbul:coverage_integration']);
  grunt.registerTask('test-release', ['mocha_istanbul:coverage_release']);
  grunt.registerTask('test-client', ['karma']);

  grunt.registerTask('test', ['test-unit', 'test-integration', 'test-release', 'istanbul_check_coverage', 'eslint']);
  grunt.registerTask('test-record', ['env:test_record', 'mocha_istanbul:coverage_integration']);
};
