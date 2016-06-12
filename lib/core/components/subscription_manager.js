'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _subscribe = require('../endpoints/subscribe');

var _subscribe2 = _interopRequireDefault(_subscribe);

var _config = require('../components/config');

var _config2 = _interopRequireDefault(_config);

var _flow_interfaces = require('../flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var subscribeEndpoints = _ref.subscribeEndpoints;
    var config = _ref.config;

    _classCallCheck(this, _class);

    this._channels = {};
    this._presenceChannels = {};

    this._channelGroups = {};
    this._presenceChannelGroups = {};

    this._config = config;
    this._subscribeEndpoints = subscribeEndpoints;

    this._timetoken = 0;
  }

  _createClass(_class, [{
    key: 'adaptStateChange',
    value: function adaptStateChange() {}
  }, {
    key: 'adaptSubscribeChange',
    value: function adaptSubscribeChange(args) {
      var _this = this;

      var timetoken = args.timetoken;
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;
      var _args$withPresence = args.withPresence;
      var withPresence = _args$withPresence === undefined ? false : _args$withPresence;


      if (timetoken) this._timetoken = timetoken;

      channels.forEach(function (channel) {
        _this._channels[channel] = true;
        if (withPresence) _this._presenceChannels[channel] = true;
      });

      channelGroups.forEach(function (channelGroup) {
        _this._channelGroups[channelGroup] = true;
        if (withPresence) _this._presenceChannelGroups[channelGroup] = true;
      });

      this.reconnect();
    }
  }, {
    key: 'adaptUnsubscribeChange',
    value: function adaptUnsubscribeChange(args) {}
  }, {
    key: 'reconnect',
    value: function reconnect() {
      this._startSubscribeLoop();
    }
  }, {
    key: '_startSubscribeLoop',
    value: function _startSubscribeLoop() {
      var _this2 = this;

      this._stopSubscribeLoop();
      var channels = [];
      var channelGroups = [];

      Object.keys(this._channels).forEach(function (channel) {
        return channels.push(channel);
      });
      Object.keys(this._presenceChannels).forEach(function (channel) {
        return channels.push(channel + '-pnpres');
      });

      Object.keys(this._channelGroups).forEach(function (channelGroup) {
        return channelGroups.push(channelGroup);
      });
      Object.keys(this._presenceChannelGroups).forEach(function (channelGroup) {
        return channelGroups.push(channelGroup + '-pnpres');
      });

      this._subscribeCall = this._subscribeEndpoints.subscribe({ channels: channels, channelGroups: channelGroups,
        timetoken: this._timetoken,
        filterExpression: this._config.filterExpression,
        region: this._region
      }, function (status, payload) {
        if (status.error) {
          console.log("subscribe tanked");
          _this2._startSubscribeLoop();
          return;
        }

        console.log(payload);
        _this2._region = payload.metadata.region;
        _this2._timetoken = payload.metadata.timetoken;
        _this2._startSubscribeLoop();
      });
    }
  }, {
    key: '_stopSubscribeLoop',
    value: function _stopSubscribeLoop() {}
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];