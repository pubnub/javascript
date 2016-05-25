'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _state = require('../components/state');

var _state2 = _interopRequireDefault(_state);

var _logger = require('../components/logger');

var _logger2 = _interopRequireDefault(_logger);

var _superagent = require('superagent');

var _superagent2 = _interopRequireDefault(_superagent);

var _defaults = require('../../../defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _endsWith2 = require('lodash/endsWith');

var _endsWith3 = _interopRequireDefault(_endsWith2);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var state = _ref.state;
    var callbacks = _ref.callbacks;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._state = state;
    this._callbacks = callbacks;
    this._l = _logger2.default.getLogger('#iterator/subscriber');

    this._state.onPresenceConfigChange(this.start.bind(this));
    this._state.onSubscriptionChange(this.start.bind(this));
    this._state.onStateChange(this.start.bind(this));
  }

  _createClass(_class, [{
    key: 'start',
    value: function start() {
      var _this = this;

      // we can have only one operation on subscribe, cancel previous call.
      this.stop();

      var channels = [];
      var channelGroups = [];
      var data = {};

      this._state.getSubscribedChannels().forEach(function (channelName) {
        var channel = _this._state.getChannel(channelName);

        channels.push(channel.name);

        if (channel.enablePresence) {
          channels.push(channel.name + _defaults2.default.PRESENCE_SUFFIX);
        }
      });

      this._state.getSubscribedChannelGroups().forEach(function (channelGroupName) {
        var channelGroup = _this._state.getChannelGroup(channelGroupName);

        channelGroups.push(channelGroup.name);

        if (channelGroup.enablePresence) {
          channelGroups.push(channelGroup.name + _defaults2.default.PRESENCE_SUFFIX);
        }
      });

      if (channels.length === 0 && channelGroups.length === 0) {
        this._l.debug('channelList and channelGroupList is empty, aborting');
        return;
      }

      var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
      var callback = this.__handleSubscribeResponse.bind(this);

      data.tt = this._state.getSubscribeTimeToken();

      if (channelGroups.length > 0) {
        data['channel-group'] = channelGroups.join(',');
      }

      if (this._state.filterExpression && this._state.filterExpression !== '') {
        data['filter-expr'] = this._state.filterExpression;
      }

      if (this._state.subscribeRegion && this._state.subscribeRegion !== '') {
        data.tr = this._state.subscribeRegion;
      }

      // include state if we have any state present
      if (this._state.getChannelsWithPresence().length > 0 || this._state.getChannelGroupsWithPresence().length > 0) {
        data.state = JSON.stringify(this._state.getPresenceState());
        data.heartbeat = this._state.getPresenceTimeout();
      }

      this._runningSuperagent = this._networking.performSubscribe(stringifiedChannels, data, callback);
    }
  }, {
    key: '__handleSubscribeResponse',
    value: function __handleSubscribeResponse(err, response) {
      if (err) {
        this.start();
        return;
      }

      var _callbacks = this._callbacks;
      var onMessage = _callbacks.onMessage;
      var onPresence = _callbacks.onPresence;


      var payload = response.m ? response.m : [];
      var timetoken = response.t.t;
      var region = response.t.r;

      payload.forEach(function (message) {
        var isPresence = false;
        var envelope = _utils2.default.v2ExpandKeys(message);

        if (envelope.channel && (0, _endsWith3.default)(envelope.channel, _defaults2.default.PRESENCE_SUFFIX)) {
          isPresence = true;
          envelope.channel = envelope.channel.replace(_defaults2.default.PRESENCE_SUFFIX, '');
        }

        if (envelope.subscriptionMatch && (0, _endsWith3.default)(envelope.subscriptionMatch, _defaults2.default.PRESENCE_SUFFIX)) {
          isPresence = true;
          envelope.subscriptionMatch = envelope.subscriptionMatch.replace(_defaults2.default.PRESENCE_SUFFIX, '');
        }

        if (isPresence) {
          onPresence(envelope);
        } else {
          onMessage(envelope);
        }
      });

      this._state.setSubscribeTimeToken(timetoken);
      this._state.subscribeRegion = region;
      this.start();
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this._runningSuperagent) {
        this._runningSuperagent.abort();
        this._runningSuperagent = null;
      }
    }
  }]);

  return _class;
}();

exports.default = _class;