'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _state = require('../components/state');

var _state2 = _interopRequireDefault(_state);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var config = _ref.config;
    var state = _ref.state;
    var callbacks = _ref.callbacks;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._config = config;
    this._state = state;
    this._callbacks = callbacks;

    this._r = new _responders2.default('#endpoints/subscribe');
    this._l = _logger2.default.getLogger('#endpoints/subscribe');
  }

  _createClass(_class, [{
    key: 'unsubscribe',
    value: function unsubscribe(args) {
      var _this = this;

      var onStatus = this._callbacks.onStatus;
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;

      var existingChannels = [];
      var existingChannelGroups = [];
      var data = {};

      if (!onStatus) {
        return this._l.error('Missing onStatus Callback');
      }

      if (channels.length === 0 && channelGroups.length === 0) {
        return onStatus(this._r.validationError('Missing Channel or Channel Group'));
      }

      if (channels) {
        channels.forEach(function (channel) {
          if (_this._state.containsChannel(channel)) {
            existingChannels.push(channel);
          }
        });
      }

      if (channelGroups) {
        channelGroups.forEach(function (channelGroup) {
          if (_this._state.containsChannelGroup(channelGroup)) {
            existingChannelGroups.push(channelGroup);
          }
        });
      }

      if (existingChannels.length === 0 && existingChannelGroups.length === 0) {
        return onStatus(this._r.validationError('already unsubscribed from all channel / channel groups'));
      }

      var stringifiedChannelParam = existingChannels.length > 0 ? existingChannels.join(',') : ',';

      if (existingChannelGroups.length > 0) {
        data['channel-group'] = existingChannelGroups.join(',');
      }

      this._networking.performLeave(stringifiedChannelParam, data, function (err, response) {
        if (err) return onStatus(err, null);

        _this._postUnsubscribeCleanup(existingChannels, existingChannelGroups);
        _this._state.setSubscribeTimeToken('0');
        _this._state.announceSubscriptionChange();
        onStatus(null, { action: 'unsubscribe', status: 'finished', response: response });
      });
    }
  }, {
    key: '_postUnsubscribeCleanup',
    value: function _postUnsubscribeCleanup(channels, channelGroups) {
      var _this2 = this;

      channels.forEach(function (channel) {
        _this2._state.removeChannel(channel);
        _this2._state.removeFromPresenceState(channel);
      });

      channelGroups.forEach(function (channelGroup) {
        _this2._state.removeChannelGroup(channelGroup);
        _this2._state.removeFromPresenceState(channelGroup);
      });
    }
  }, {
    key: 'subscribe',
    value: function subscribe(args) {
      var _this3 = this;

      var _args$channels2 = args.channels;
      var channels = _args$channels2 === undefined ? [] : _args$channels2;
      var _args$channelGroups2 = args.channelGroups;
      var channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;
      var _args$enablePresence = args.enablePresence;
      var enablePresence = _args$enablePresence === undefined ? false : _args$enablePresence;
      var filterExpression = args.filterExpression;
      var onStatus = this._callbacks.onStatus;


      if (channels.length === 0 && channelGroups.length === 0) {
        return onStatus(this._r.validationError('Missing Channel or Channel Group'));
      }

      channels.forEach(function (channel) {
        _this3._state.addChannel(channel, { name: channel, enablePresence: enablePresence });
      });

      channelGroups.forEach(function (channelGroup) {
        _this3._state.addChannelGroup(channelGroup, { name: channelGroup, enablePresence: enablePresence });
      });

      this._state.filterExpression = '';

      if (filterExpression) {
        this._state.filterExpression = filterExpression;
      }

      this._state.announceSubscriptionChange();
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];