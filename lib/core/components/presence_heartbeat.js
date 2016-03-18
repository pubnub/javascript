'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* flow */

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _state = require('./state');

var _state2 = _interopRequireDefault(_state);

var _presence = require('../endpoints/presence');

var _presence2 = _interopRequireDefault(_presence);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var constants = require('../../../defaults.json');
var logger = _logger2.default.getLogger('component/presenceHeartbeat');

var _class = function () {
  function _class(config, state, presence) {
    _classCallCheck(this, _class);

    this._state = state;
    this._presence = presence;

    // this._state.onSubscriptionChange(this.__start.bind(this));
  }

  /**
    removes scheduled presence heartbeat executions and executes
    a new presence heartbeat with the new interval
  */


  _createClass(_class, [{
    key: '__start',
    value: function __start() {
      logger.debug('(re-)starting presence heartbeat');
      this.__start();
      this.__periodicHeartbeat();
    }

    /**
      remove presence heartbeat schedules;
    */

  }, {
    key: '__stop',
    value: function __stop() {
      logger.debug('stopping presence heartbeat');
      clearTimeout(this._intervalId);
      this._intervalId = null;
    }
  }, {
    key: '__periodicHeartbeat',
    value: function __periodicHeartbeat() {
      var timeoutInterval = this._config.getHeartbeatInterval() * constants.SECOND;

      // if the heartbeat interval is not within the allowed range, exit early
      if (this._config.getHeartbeatInterval() < 1 || this._config.getHeartbeatInterval() > 500) {
        logger.debug('interval is greater than 500 or below 1; aborting');
        return;
      }

      // if there are no active channel / channel groups, bail out.
      if (!this._state.getChannels(true).length && !this._state.getChannelGroups(true).length) {
        logger.debug('there are no channels / channel groups to heartbeat; aborting');
        return;
      }

      this._presence.heartbeat({
        callback: function callback() {
          this._intervalId = setTimeout(this._presence_heartbeat, timeoutInterval);
        },
        error: function error(e) {
          if (this._error) {
            this._error('Presence Heartbeat unable to reach Pubnub servers', e);
          }

          this._intervalId = setTimeout(this._presence_heartbeat, timeoutInterval);
        }
      });
    }
  }]);

  return _class;
}();

exports.default = _class;