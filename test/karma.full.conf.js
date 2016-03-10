var parentConfig = require('./karma.conf.js');

module.exports = function(config) {
  config = parentConfig(config);
  config.files.unshift('dist/web/pubnub.js');
};
