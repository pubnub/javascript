var webpack = require('webpack');
var StatsPlugin = require('stats-webpack-plugin');

var config = {
  module: {
    loaders: [
      { test: /\.json/, loader: 'json' },
      { test: /\.js$/, exclude: /(node_modules|bower_components)/, loader: 'babel' }
    ],
  },
  node: {
    console: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    formidable: 'empty',
    'superagent-proxy': 'empty',
  },
  output: {
    filename: 'pubnub.js',
    library: 'PubNub',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.BannerPlugin(require('./package.json').version + ' / Consumer ', {
      raw: false, entryOnly: true,
    }),
    new StatsPlugin('stats.json', {
      chunkModules: true,
      exclude: [/node_modules[\\\/]react/]
    })
  ],
  externals: [{
    'superagent-proxy': 'superagent-proxy'
  }],
  profile: true
};

module.exports = config;
