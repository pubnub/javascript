module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mocha_istanbul: {
      coverage_unit: {
        src: 'node.js/tests', // a folder works nicely
        options: {
          mask: '**/*.test.js'
        }
      }
    },
    mochaTest: {
      unit: {
        options: {
          reporter: "spec",
          require: 'node.js/tests/tests-include.js',
          quiet: false
        },
        src: ['node.js/tests/unit/*.test.js']
      },
      integration: {
        options: {
          reporter: "spec",
          require: 'node.js/tests/tests-include.js',
          quiet: false
        },
        src: ['node.js/tests/integration/*.test.js']
      }
    },
    eslint: {
      target: [
        'node.js/*.js',
        'node.js/lib/*.js'
      ]
    },
    nodeunit: {
      tests: ['node.js/**/tests/unit-test.js'],
      options: {}
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  grunt.registerTask('test:mocha', 'mochaTest');
  grunt.registerTask('test:unit', 'nodeunit');
  grunt.registerTask('ci-test', ['mochaTest:unit', 'eslint']);
  grunt.registerTask('test', ['mocha_istanbul', 'eslint']);
};