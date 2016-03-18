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

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var state = _ref.state;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._state = state;
    this._r = new _responders2.default('#endpoints/presence');
    this._l = _logger2.default.getLogger('#endpoints/presence');
  }

  _createClass(_class, [{
    key: 'hereNow',
    value: function hereNow(args, callback) {
      var channel = args.channel;
      var channelGroup = args.channelGroup;
      var _args$uuids = args.uuids;
      var uuids = _args$uuids === undefined ? true : _args$uuids;
      var state = args.state;

      var data = {};

      if (!uuids) data.disable_uuids = 1;
      if (state) data.state = 1;

      // Make sure we have a Channel
      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (channelGroup) {
        data['channel-group'] = channelGroup;
      }

      this._networking.fetchHereNow(channel, channelGroup, data, callback);
    }
  }, {
    key: 'whereNow',
    value: function whereNow(args, callback) {
      var uuid = args.uuid;


      if (!callback) {
        return this._l.error('Missing Callback');
      }

      this._networking.fetchWhereNow(uuid, callback);
    }
  }, {
    key: 'getState',
    value: function getState(args, callback) {
      var uuid = args.uuid;
      var channel = args.channel;
      var channelGroup = args.channelGroup;

      var data = {};

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (!channel && !channelGroup) {
        return callback(this._r.validationError('Channel or Channel Group must be supplied'));
      }

      if (channelGroup) {
        data['channel-group'] = channelGroup;
      }

      if (!channel) {
        channel = ',';
      }

      this._networking.fetchState(uuid, channel, data, callback);
    }
  }, {
    key: 'setState',
    value: function setState(args, callback) {
      var _this = this;

      var state = args.state;
      var channel = args.channel;
      var channelGroup = args.channelGroup;

      var data = {};
      var channelsWithPresence = [];
      var channelGroupsWithPresence = [];

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (!channel && !channelGroup) {
        return callback(this._r.validationError('Channel or Channel Group must be supplied'));
      }

      if (!state) {
        return callback(this._r.validationError('State must be supplied'));
      }

      data.state = state;

      if (channel) {
        var channelList = (channel.join ? channel.join(',') : '' + channel).split(',');
        channelList.forEach(function (channel) {
          if (_this._state.getChannel(channel)) {
            _this._state.addToPresenceState(channel, state);
            channelsWithPresence.push(channel);
          }
        });
      }

      if (channelGroup) {
        var channelGroupList = (channelGroup.join ? channelGroup.join(',') : '' + channelGroup).split(',');
        channelGroupList.forEach(function (channel) {
          if (_this._state.getChannelGroup(channel)) {
            _this._state.addToPresenceState(channel, state);
            channelGroupsWithPresence.push(channel);
          }
        });
      }

      if (channelsWithPresence.length === 0 && channelGroupsWithPresence.length === 0) {
        return callback(this._r.validationError('No subscriptions exists for the states'));
      }

      if (channelGroupsWithPresence.length > 0) {
        data['channel-group'] = channelGroupsWithPresence.join(',');
      }

      if (channelsWithPresence.length === 0) {
        channel = ',';
      } else {
        channel = channelsWithPresence.join(',');
      }

      this._networking.setState(channel, data, function (err, response) {
        if (err) return callback(err, response);
        _this._state.announceStateChange();
        return callback(err, response);
      });
    }
  }, {
    key: 'heartbeat',
    value: function heartbeat(args) {
      var callback = args.callback || function () {};
      var err = args.error || function () {};
      var data = {
        uuid: this._keychain.getUUID(),
        auth: this._keychain.getAuthKey()
      };

      var st = JSON.stringify(this._state.getPresenceState());
      if (st.length > 2) {
        data.state = JSON.stringify(this._state.getPresenceState());
      }

      if (this._config.getPresenceTimeout() > 0 && this._config.getPresenceTimeout() < 320) {
        data.heartbeat = this._config.getPresenceTimeout();
      }

      var channels = _utils2.default.encode(this._state.generate_channel_list(true).join(','));
      var channelGroups = this._state.generate_channel_group_list(true).join(',');

      if (!channels) channels = ',';
      if (channelGroups) data['channel-group'] = channelGroups;

      if (this._config.isInstanceIdEnabled()) {
        data.instanceid = this._keychain.getInstanceId();
      }

      if (this._config.isRequestIdEnabled()) {
        data.requestid = _utils2.default.generateUUID();
      }

      this._networking.performHeartbeat(channels, {
        data: this._networking.prepareParams(data),
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail(response) {
          _responders2.default.error(response, err);
        }
      });
    }
  }]);

  return _class;
}();

exports.default = _class;