let webpack = require('webpack');
let StatsPlugin = require('stats-webpack-plugin');
let config = Object.assign({}, require('./webpack.config.common'));

const packageJSON = require('./package.json');

config.target = 'web';

config.output = {
  filename: 'pubnub.js',
  library: 'PubNub',
  libraryTarget: 'umd'
};

config.plugins = [
  new webpack.BannerPlugin({ banner: `${packageJSON.version} / Consumer `, raw: false }),
  new StatsPlugin('stats.json', {
    chunkModules: true,
    exclude: ['node_modules']
  })
];

module.exports = config;
