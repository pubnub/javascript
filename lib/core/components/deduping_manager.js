'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var hashCode = function hashCode(payload) {
  var hash = 0;
  if (payload.length === 0) return hash;
  for (var i = 0; i < payload.length; i += 1) {
    var character = payload.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash = hash & hash;
  }
  return hash;
};

var _class = function () {
  function _class(_ref) {
    var config = _ref.config;

    _classCallCheck(this, _class);

    this.hashHistory = [];
    this._config = config;
  }

  _createClass(_class, [{
    key: 'getKey',
    value: function getKey(message) {
      var hashedPayload = hashCode(JSON.stringify(message.payload)).toString();
      var timetoken = message.publishMetaData.publishTimetoken;
      return timetoken + '-' + hashedPayload;
    }
  }, {
    key: 'isDuplicate',
    value: function isDuplicate(message) {
      return this.hashHistory.includes(this.getKey(message));
    }
  }, {
    key: 'addEntry',
    value: function addEntry(message) {
      if (this.hashHistory.length >= this._config.maximumCacheSize) {
        this.hashHistory.shift();
      }

      this.hashHistory.push(this.getKey(message));
    }
  }, {
    key: 'clearHistory',
    value: function clearHistory() {
      this.hashHistory = [];
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=deduping_manager.js.map
