'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _state = require('../components/state');

var _state2 = _interopRequireDefault(_state);

var _presence = require('../endpoints/presence');

var _presence2 = _interopRequireDefault(_presence);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var constants = require('../../../defaults.json');

var _class = function () {
  function _class(_ref) {
    var state = _ref.state;
    var presence = _ref.presence;
    var callbacks = _ref.callbacks;

    _classCallCheck(this, _class);

    this._state = state;
    this._presence = presence;
    this._callbacks = callbacks;

    this._state.onPresenceConfigChange(this.start.bind(this));
    this._state.onSubscriptionChange(this.start.bind(this));
    this._state.onStateChange(this.start.bind(this));

    this._l = _logger2.default.getLogger('#iterators/presence_heartbeat');
  }

  _createClass(_class, [{
    key: 'start',
    value: function start() {
      this._l.debug('(re-)starting presence heartbeat');
      this.stop();
      this.__periodicHeartbeat();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this._l.debug('stopping presence heartbeat');
      clearTimeout(this._intervalId);
      this._intervalId = null;
    }
  }, {
    key: '__periodicHeartbeat',
    value: function __periodicHeartbeat() {
      var _this = this;

      var onStatus = this._callbacks.onStatus;

      var timeoutInterval = this._state.getPresenceAnnounceInterval() * constants.SECOND;

      if (this._state.getPresenceAnnounceInterval() < 1 || this._state.getPresenceAnnounceInterval() > 500) {
        this._l.debug('interval is greater than 500 or below 1; aborting');
        return;
      }

      if (this._state.getChannelsWithPresence().length === 0 && this._state.getChannelGroupsWithPresence().length === 0) {
        this._l.debug('there are no channels / channel groups to heartbeat; aborting');
        return;
      }

      this._presence.heartbeat(function (err) {
        _this._intervalId = setTimeout(_this.__periodicHeartbeat, timeoutInterval);

        if (err) {
          onStatus({
            type: 'heartbeatFailure',
            message: 'Presence Heartbeat unable to reach Pubnub servers',
            rawError: err
          });
        }
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];