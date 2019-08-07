let webpack = require('webpack');
let StatsPlugin = require('stats-webpack-plugin');

const packageJSON = require('./package.json');

let config = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.json/,
        use: 'json-loader'
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    formidable: 'empty',
  },
  target: 'web',
  output: {
    filename: 'pubnub.js',
    library: 'PubNub',
    libraryTarget: 'umd',
    libraryExport: 'default'
  },
  plugins: [
    new webpack.BannerPlugin({ banner: `${packageJSON.version} / Consumer `, raw: false }),
    new StatsPlugin('stats.json', {
      chunkModules: true,
      exclude: ['node_modules']
    })
  ],
  externals: [],
  profile: true
};

module.exports = config;
