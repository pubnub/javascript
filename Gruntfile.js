module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      lockdown: {
        VCR_MODE: 'playback'
      },
      record: {
        VCR_MODE: 'cache'
      }
    },
    karma: {
      webFull: { configFile: 'web/tests/karma.conf.js' },
      webMin: { configFile: 'web/tests/karma.min.conf.js' },
      modernFull: { configFile: 'modern/tests/karma.conf.js' },
      modernMin: { configFile: 'modern/tests/karma.min.conf.js' }
    },
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
        'node.js/tests/unit/**/*.js',
        'node.js/*.js',
        'node.js/lib/*.js',
        'test/**/*.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-istanbul');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('lockdown', ['env:lockdown']);
  grunt.registerTask('record', ['env:record']);

  grunt.registerTask('test-old', ['mocha_istanbul:old']);
  grunt.registerTask('test-unit', ['mocha_istanbul:coverage_unit']);
  grunt.registerTask('test-integration', ['mocha_istanbul:coverage_integration']);
  grunt.registerTask('test-release', ['mocha_istanbul:coverage_release']);
  grunt.registerTask('test-client', ['karma']);

  grunt.registerTask('test', ['test-unit', 'test-integration', 'test-release', 'istanbul_check_coverage', 'eslint']);
  grunt.registerTask('test-record', ['env:test_record', 'mocha_istanbul:coverage_integration']);
};
