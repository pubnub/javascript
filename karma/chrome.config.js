const process = require('process');
const puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();

const webpackConfig = require('../webpack.config.common.js');

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],

    files: [
      '../src/web/index.js',
      '../' + process.argv[process.argv.length - 1],
    ],

    preprocessors: {
      '../src/**/*.js': ['webpack', 'sourcemap'],
      '../test/**/*.js': ['webpack', 'sourcemap'],
    },

    webpack: {
      ...webpackConfig,
      target: 'web',
      stats: 'none',
      devtool: 'inline-source-map',
    },

    webpackMiddleware: {
      logLevel: 'error',
    },

    reporters: ['spec'],
    colors: true,
    logLevel: config.LOG_ERROR,
    autoWatch: false,

    browsers: ['Chrome_PubNub'],
    singleRun: true,

    browserDisconnectTimeout: 20000,
    browserNoActivityTimeout: 20000,

    customLaunchers: {
      Chrome_PubNub: {
        base: 'ChromeHeadless',
        flags: ['--disable-web-security'],
      },
    },
  });
};
