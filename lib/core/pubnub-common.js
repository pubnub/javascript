'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('./components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('./components/config');

var _config2 = _interopRequireDefault(_config);

var _index = require('./components/cryptography/index');

var _index2 = _interopRequireDefault(_index);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _time = require('./endpoints/time');

var _time2 = _interopRequireDefault(_time);

var _presence = require('./endpoints/presence');

var _presence2 = _interopRequireDefault(_presence);

var _history = require('./endpoints/history');

var _history2 = _interopRequireDefault(_history);

var _push = require('./endpoints/push');

var _push2 = _interopRequireDefault(_push);

var _access = require('./endpoints/access');

var _access2 = _interopRequireDefault(_access);

var _channel_groups = require('./endpoints/channel_groups');

var _channel_groups2 = _interopRequireDefault(_channel_groups);

var _publish = require('./endpoints/publish');

var _publish2 = _interopRequireDefault(_publish);

var _flow_interfaces = require('./flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(setup) {
    _classCallCheck(this, _class);

    var sendBeacon = setup.sendBeacon;
    var db = setup.db;


    this.config = new _config2.default(setup);
    this.crypto = new _index2.default({ config: this.config });
    this.networking = new _networking2.default({ config: this.config, crypto: this.crypto, sendBeacon: sendBeacon });

    db.set(this.config.subscribeKey + 'uuid', this.config.UUID);

    var timeEndpoint = new _time2.default({ networking: this.networking, config: this.config });
    this.time = timeEndpoint.fetch.bind(timeEndpoint);

    var publishEndpoints = new _publish2.default({ networking: this.networking });
    this.publish = publishEndpoints.publish.bind(publishEndpoints);
  }

  _createClass(_class, [{
    key: 'getVersion',
    value: function getVersion() {
      return _package2.default.version;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];