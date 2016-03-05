'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _each2 = require('lodash/each');

var _each3 = _interopRequireDefault(_each2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    this._channelStorage = {};
    this._channelGroupStorage = {};
  }

  _createClass(_class, [{
    key: 'containsChannel',
    value: function containsChannel(name) {
      return name in this._channelStorage;
    }
  }, {
    key: 'containsChannelGroup',
    value: function containsChannelGroup(name) {
      return name in this._channelGroupStorage;
    }
  }, {
    key: 'getChannel',
    value: function getChannel(name) {
      return this._channelStorage[name];
    }
  }, {
    key: 'getChannelGroup',
    value: function getChannelGroup(name) {
      return this._channelGroupStorage[name];
    }
  }, {
    key: 'addChannel',
    value: function addChannel(name, metadata) {
      this._channelStorage[name] = metadata;
    }
  }, {
    key: 'addChannelGroup',
    value: function addChannelGroup(name, metadata) {
      this._channelGroupStorage[name] = metadata;
    }

    /**
     * Generate Subscription Channel List
     * ==================================
     * generate_channel_list(channels_object);
     * nopresence (==include-presence) == false --> presence True
     */

  }, {
    key: 'generate_channel_list',
    value: function generate_channel_list(nopresence) {
      var list = [];
      (0, _each3.default)(this._channelStorage, function (status, channel) {
        if (nopresence) {
          if (channel.search('-pnpres') < 0) {
            if (status.subscribed) list.push(channel);
          }
        } else {
          if (status.subscribed) list.push(channel);
        }
      });
      return list.sort();
    }

    /**
     * Generate Subscription Channel Groups List
     * ==================================
     * generate_channel_group_list(channels_groups object);
     */

  }, {
    key: 'generate_channel_group_list',
    value: function generate_channel_group_list(nopresence) {
      var list = [];
      (0, _each3.default)(this._channelGroupStorage, function (status, channel_group) {
        if (nopresence) {
          if (channel_group.search('-pnpres') < 0) {
            if (status.subscribed) list.push(channel_group);
          }
        } else {
          if (status.subscribed) list.push(channel_group);
        }
      });
      return list.sort();
    }
  }]);

  return _class;
}();

exports.default = _class;
//# sourceMappingURL=state.js.map
