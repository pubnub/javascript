var webpack = require('webpack');
var StatsPlugin = require('stats-webpack-plugin');

var config = {
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
    new StatsPlugin('stats.json', {
      chunkModules: true,
      exclude: [/node_modules[\\\/]react/]
    })
  ],
  externals: [],
  profile: true
};

module.exports = config;
