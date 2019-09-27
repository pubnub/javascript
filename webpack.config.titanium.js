let webpack = require('webpack');
let StatsPlugin = require('stats-webpack-plugin');
let WrapperPlugin = require('wrapper-webpack-plugin');
let config = Object.assign({}, require('./webpack.config.common'));

const packageJSON = require('./package.json');

config.target = 'node';

config.output = {
  filename: 'pubnub.js',
  library: 'PubNub',
  libraryTarget: 'commonjs'
};

config.plugins = [
  new webpack.BannerPlugin({ banner: `${packageJSON.version} / Consumer `, raw: false }),
  new StatsPlugin('stats.json', {
    chunkModules: true,
    exclude: ['node_modules']
  }),
  new WrapperPlugin({
    footer: 'module.exports = exports.PubNub;'
  })
];

module.exports = config;
