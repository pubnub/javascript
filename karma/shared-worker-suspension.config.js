const process = require('process');

module.exports = function (config) {
  config.set({
    basePath: '../',

    frameworks: ['mocha', 'chai'],

    files: [
      'dist/web/pubnub.js',
      { pattern: 'dist/web/pubnub.worker.js', included: false, served: true },
      'test/integration/shared-worker/shared-worker-suspension.test.ts',
    ],

    exclude: [],

    preprocessors: {
      'test/**/*.ts': ['webpack', 'sourcemap'],
    },

    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
          "crypto": false,
          "stream": false,
          "buffer": require.resolve("buffer"),
          "util": require.resolve("util/"),
          "url": false,
          "querystring": false,
          "path": false,
          "fs": false,
          "net": false,
          "tls": false,
          "os": false,
          "process": require.resolve("process/browser"),
        },
      },
      plugins: [
        new (require('webpack')).ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        }),
        new (require('webpack')).DefinePlugin({
          'process.env.SUBSCRIBE_KEY': JSON.stringify(process.env.SUBSCRIBE_KEY || 'demo'),
          'process.env.PUBLISH_KEY': JSON.stringify(process.env.PUBLISH_KEY || 'demo'),
        }),
      ],
      devtool: 'inline-source-map',
      stats: 'errors-only',
    },

    webpackMiddleware: {
      logLevel: 'error',
    },

    reporters: ['spec'],

    port: 9877,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['Chrome_SharedWorker'],

    singleRun: true,

    browserDisconnectTimeout: 30000,

    browserNoActivityTimeout: 60000,

    captureTimeout: 30000,

    customLaunchers: {
      Chrome_SharedWorker: {
        base: 'ChromeHeadless',
        flags: [
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--enable-shared-worker',
          '--allow-running-insecure-content',
          '--disable-background-timer-throttling',
          '--disable-renderer-backgrounding',
          '--disable-backgrounding-occluded-windows',
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
    },

    client: {
      mocha: {
        timeout: 30000,
        reporter: 'spec',
      },
      captureConsole: true,
    },

    proxies: {
      '/dist/': '/base/dist/',
    },
  });
};
