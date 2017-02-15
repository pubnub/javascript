let webpack = require('webpack');
let StatsPlugin = require('stats-webpack-plugin');

const packageJSON = require('./package.json');

let config = {
  module: {
    loaders: [
      { test: /\.json/, loader: 'json' },
      { test: /\.js$/, exclude: /(node_modules|bower_components)/, loader: 'babel' }
    ],
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    formidable: 'empty',
  },
  output: {
    filename: 'pubnub.js',
    library: 'PubNub',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.BannerPlugin(`${packageJSON.version} / Consumer `, {
      raw: false, entryOnly: true,
    }),
    new StatsPlugin('stats.json', {
      chunkModules: true,
      exclude: ['node_modules']
    })
  ],
  externals: [],
  profile: true
};

module.exports = config;
