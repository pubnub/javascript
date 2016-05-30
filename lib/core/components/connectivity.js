'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _networking = require('./networking');

var _networking2 = _interopRequireDefault(_networking);

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _time = require('../endpoints/time');

var _time2 = _interopRequireDefault(_time);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = _logger2.default.getLogger('component/Connectivity');

var _class = function () {
  function _class(_ref) {
    var eventEmitter = _ref.eventEmitter;
    var networking = _ref.networking;
    var timeEndpoint = _ref.timeEndpoint;

    _classCallCheck(this, _class);

    this._eventEmitter = eventEmitter;
    this._networking = networking;
    this._timeEndpoint = timeEndpoint;

    this._eventEmitter.on('unreachableHTTP', this.__onUnreachableHTTP);
  }

  _createClass(_class, [{
    key: 'detect_latency',
    value: function detect_latency(tt) {
      var adjusted_time = _utils2.default.rnow() - this._timeDrift;
      return adjusted_time - tt / 10000;
    }
  }, {
    key: 'start',
    value: function start() {
      this.__detect_time_delta(function () {}, null);
    }
  }, {
    key: 'stop',
    value: function stop() {}
  }, {
    key: '__onUnreachableHTTP',
    value: function __onUnreachableHTTP() {
      console.log('HTTP FAILED');
    }
  }, {
    key: '__poll_online',
    value: function __poll_online() {
      _is_online() || _reset_offline(1, { error: 'Offline. Please check your network settings.' });
      _poll_timer && clearTimeout(_poll_timer);
      _poll_timer = _utils2.default.timeout(_poll_online, constants.SECOND);
    }
  }, {
    key: '__poll_online2',
    value: function __poll_online2() {
      SELF['time'](function (success) {
        detect_time_detla(function () {}, success);
        success || _reset_offline(1, {
          error: 'Heartbeat failed to connect to Pubnub Servers.' + 'Please check your network settings.'
        });
        _poll_timer2 && clearTimeout(_poll_timer2);
        _poll_timer2 = _utils2.default.timeout(_poll_online2, KEEPALIVE);
      });
    }
  }, {
    key: '__detect_time_delta',
    value: function __detect_time_delta(cb, time) {
      var _this = this;

      var stime = _utils2.default.rnow();

      var calculate = function calculate(time) {
        if (!time) return;
        var ptime = time / 10000;
        var latency = (_utils2.default.rnow() - stime) / 2;
        _this._timeDrift = _utils2.default.rnow() - (ptime + latency);
        if (cb) cb(_this._timeDrift);
      };

      if (time) {
        calculate(time);
      } else {
        this._timeEndpoint.fetchTime(calculate);
      }
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];