const process = require('process');

module.exports = function (config) {
  config.set({
    // Base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',

    // Frameworks to use
    frameworks: ['mocha', 'chai'],

    // List of files / patterns to load in the browser
    files: [
      // Include the built PubNub library
      'dist/web/pubnub.js',
      // Include the shared worker file
      { pattern: 'dist/web/pubnub.worker.js', included: false, served: true },
      // Include the test file
      'test/integration/shared-worker/shared-worker.test.ts',
    ],

    // List of files to exclude
    exclude: [],

    // Preprocess matching files before serving them to the browser
    preprocessors: {
      'test/**/*.ts': ['webpack', 'sourcemap'],
    },

    // Webpack configuration
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
      ],
      devtool: 'inline-source-map',
      stats: 'errors-only',
    },

    webpackMiddleware: {
      logLevel: 'error',
    },

    // Test results reporter to use
    reporters: ['spec'],

    // Web server port
    port: 9876,

    // Enable / disable colors in the output (reporters and logs)
    colors: true,

    // Level of logging
    logLevel: config.LOG_INFO,

    // Enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers
    browsers: ['Chrome_SharedWorker'],

    // Continuous Integration mode
    singleRun: true,

    // Browser disconnect timeout
    browserDisconnectTimeout: 30000,

    // Browser no activity timeout
    browserNoActivityTimeout: 30000,

    // Capture timeout
    captureTimeout: 30000,

    // Custom launcher for shared worker testing
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

    // Client configuration
    client: {
      mocha: {
        timeout: 30000, // Longer timeout for network tests
        reporter: 'spec',
      },
      captureConsole: true,
    },

    // Proxies for serving worker files
    proxies: {
      '/dist/': '/base/dist/',
    },
  });
}; 