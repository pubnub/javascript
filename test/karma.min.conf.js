var parentConfig = require('./karma.conf.js');

module.exports = function(config) {
  var config = parentConfig(config);
  config.files.unshift('dist/web/pubnub.min.js');
};
