'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

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

    _classCallCheck(this, _class);

    this._networking = networking;
    this._r = new _responders2.default('#endpoints/history');
    this._l = _logger2.default.getLogger('#endpoints/history');
  }

  // generic function to handle all channel group operations


  _createClass(_class, [{
    key: 'channelGroup',
    value: function channelGroup(args, callback) {
      var providedChannelGroupName = args.channelGroup;
      var channels = args.channels || args.channel;
      var effectiveChannelGroupName = '';

      var data = {};
      var mode = args.mode || 'add';

      if (providedChannelGroupName) {
        var splitChannelGroupName = providedChannelGroupName.split(':');

        if (splitChannelGroupName.length > 1) {
          effectiveChannelGroupName = splitChannelGroupName[1];
        } else {
          effectiveChannelGroupName = splitChannelGroupName[0];
        }
      }

      if (channels) {
        if (_utils2.default.isArray(channels)) {
          channels = channels.join(',');
        }
        data[mode] = channels;
      }

      this._networking.performChannelGroupOperation(effectiveChannelGroupName, mode, data, callback);
    }
  }, {
    key: 'listChannels',
    value: function listChannels(args, callback) {
      if (!args.channelGroup) {
        return callback(this._r.validationError('Missing Channel Group'));
      }

      this.channelGroup(args, callback);
    }
  }, {
    key: 'removeGroup',
    value: function removeGroup(args, callback) {
      var errorMessage = 'Use channel_group_remove_channel if you want to remove a channel from a group.';
      if (!args.channelGroup) {
        return callback(this._r.validationError('Missing Channel Group'));
      }

      if (args.channel) {
        return callback(this._r.validationError(errorMessage));
      }

      args.mode = 'remove';
      this.channelGroup(args, callback);
    }
  }, {
    key: 'listGroups',
    value: function listGroups(args, callback) {
      this.channelGroup(args, callback);
    }
  }, {
    key: 'addChannel',
    value: function addChannel(args, callback) {
      if (!args.channelGroup) {
        return callback(this._r.validationError('Missing Channel Group'));
      }

      if (!args.channel && !args.channels) {
        return callback(this._r.validationError('Missing Channel'));
      }
      this.channelGroup(args, callback);
    }
  }, {
    key: 'removeChannel',
    value: function removeChannel(args, callback) {
      if (!args.channelGroup) {
        return callback(this._r.validationError('Missing Channel Group'));
      }
      if (!args.channel && !args.channels) {
        return callback(this._r.validationError('Missing Channel'));
      }

      args.mode = 'remove';
      this.channelGroup(args, callback);
    }
  }]);

  return _class;
}();

exports.default = _class;