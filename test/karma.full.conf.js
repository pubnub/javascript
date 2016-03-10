var parentConfig = require('./karma.conf.js');

module.exports = function(config) {
  config = parentConfig(config);
  config.files.unshift('distributable/web/pubnub.js');
};
