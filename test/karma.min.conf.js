var parentConfig = require('./karma.conf.js');

module.exports = function(config) {
  var config = parentConfig(config);
  config.files.unshift('distributable/web/pubnub.min.js');
};
