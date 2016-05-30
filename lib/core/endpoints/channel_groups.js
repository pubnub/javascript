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

  _createClass(_class, [{
    key: 'channelGroup',
    value: function channelGroup(args, callback) {
      var channelGroup = args.channelGroup;
      var _args$channels = args.channels;
      var channels = _args$channels === undefined ? [] : _args$channels;


      var effectiveChannelGroupName = '';
      var data = {};
      var mode = args.mode || 'add';

      if (channelGroup) {
        var splitChannelGroupName = channelGroup.split(':');

        if (splitChannelGroupName.length > 1) {
          effectiveChannelGroupName = splitChannelGroupName[1];
        } else {
          effectiveChannelGroupName = splitChannelGroupName[0];
        }
      }

      if (channels.length > 0) {
        data[mode] = channels.join(',');
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
    key: 'deleteGroup',
    value: function deleteGroup(args, callback) {
      var errorMessage = 'Use removeChannel to remove a channel from a group.';
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
    key: 'addChannels',
    value: function addChannels(args, callback) {
      var channelGroup = args.channelGroup;
      var _args$channels2 = args.channels;
      var channels = _args$channels2 === undefined ? [] : _args$channels2;


      if (!channelGroup) {
        return callback(this._r.validationError('Missing Channel Group'));
      }

      if (channels.length === 0) {
        return callback(this._r.validationError('Missing Channel'));
      }

      args.mode = 'add';
      this.channelGroup(args, callback);
    }
  }, {
    key: 'removeChannels',
    value: function removeChannels(args, callback) {
      var channelGroup = args.channelGroup;
      var _args$channels3 = args.channels;
      var channels = _args$channels3 === undefined ? [] : _args$channels3;


      if (!channelGroup) {
        return callback(this._r.validationError('Missing Channel Group'));
      }
      if (channels.length === 0) {
        return callback(this._r.validationError('Missing Channel'));
      }

      args.mode = 'remove';
      this.channelGroup(args, callback);
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];