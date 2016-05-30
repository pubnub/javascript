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
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;
      var _args$channelGroups = args.channelGroups;
      var channelGroups = _args$channelGroups === undefined ? [] : _args$channelGroups;
      var _args$uuids = args.uuids;
      var uuids = _args$uuids === undefined ? true : _args$uuids;
      var state = args.state;

      var data = {};

      if (!uuids) data.disable_uuids = 1;
      if (state) data.state = 1;

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (channelGroups.length > 0) {
        data['channel-group'] = channelGroups.join(',');
      }

      var stringifiedChannels = channels.length > 0 ? channels.join(',') : null;
      var stringifiedChannelGroups = channelGroups.length > 0 ? channelGroups.join(',') : null;
      this._networking.fetchHereNow(stringifiedChannels, stringifiedChannelGroups, data, callback);
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
      var _args$channels2 = args.channels;
      var channels = _args$channels2 === undefined ? [] : _args$channels2;
      var _args$channelGroups2 = args.channelGroups;
      var channelGroups = _args$channelGroups2 === undefined ? [] : _args$channelGroups2;

      var data = {};

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (channels.length === 0 && channelGroups.length === 0) {
        return callback(this._r.validationError('Channel or Channel Group must be supplied'));
      }

      if (channelGroups.length > 0) {
        data['channel-group'] = channelGroups.join(',');
      }

      var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
      this._networking.fetchState(uuid, stringifiedChannels, data, callback);
    }
  }, {
    key: 'setState',
    value: function setState(args, callback) {
      var _this = this;

      var state = args.state;
      var _args$channels3 = args.channels;
      var channels = _args$channels3 === undefined ? [] : _args$channels3;
      var _args$channelGroups3 = args.channelGroups;
      var channelGroups = _args$channelGroups3 === undefined ? [] : _args$channelGroups3;

      var data = {};
      var channelsWithPresence = [];
      var channelGroupsWithPresence = [];

      if (!callback) {
        return this._l.error('Missing Callback');
      }

      if (channels.length === 0 && channelGroups.length === 0) {
        return callback(this._r.validationError('Channel or Channel Group must be supplied'));
      }

      if (!state) {
        return callback(this._r.validationError('State must be supplied'));
      }

      data.state = state;

      channels.forEach(function (channel) {
        if (_this._state.getChannel(channel)) {
          _this._state.addToPresenceState(channel, state);
          channelsWithPresence.push(channel);
        }
      });

      channelGroups.forEach(function (channel) {
        if (_this._state.getChannelGroup(channel)) {
          _this._state.addToPresenceState(channel, state);
          channelGroupsWithPresence.push(channel);
        }
      });

      if (channelsWithPresence.length === 0 && channelGroupsWithPresence.length === 0) {
        return callback(this._r.validationError('No subscriptions exists for the states'));
      }

      if (channelGroupsWithPresence.length > 0) {
        data['channel-group'] = channelGroupsWithPresence.join(',');
      }

      var stringifiedChannels = channelsWithPresence.length > 0 ? channelsWithPresence.join(',') : ',';

      this._networking.setState(stringifiedChannels, data, function (err, response) {
        if (err) return callback(err, response);
        _this._state.announceStateChange();
        return callback(err, response);
      });
    }
  }, {
    key: 'heartbeat',
    value: function heartbeat(callback) {
      var data = {
        state: JSON.stringify(this._state.getPresenceState()),
        heartbeat: this._state.getPresenceTimeout()
      };

      var channels = this._state.getSubscribedChannels();
      var channelGroups = this._state.getSubscribedChannelGroups();

      if (channelGroups.length > 0) {
        data['channel-group'] = channelGroups.join(',');
      }

      var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';

      this._networking.performHeartbeat(stringifiedChannels, data, callback);
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];