var webpack = require('webpack');
var StatsPlugin = require('stats-webpack-plugin');

var config = {
  module: {
    loaders: [
      { test: /\.json/, loader: 'json' },
    ],
  },
  node: {
    console: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    formidable: 'empty'
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
  externals: [],
  profile: true
};

module.exports = config;
