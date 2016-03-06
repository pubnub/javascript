'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class() {
    _classCallCheck(this, _class);

    this._channelStorage = new Map();
    this._channelGroupStorage = new Map();
  }

  _createClass(_class, [{
    key: 'containsChannel',
    value: function containsChannel(name) {
      return this._channelStorage.has(name);
    }
  }, {
    key: 'containsChannelGroup',
    value: function containsChannelGroup(name) {
      return this._channelGroupStorage.has(name);
    }
  }, {
    key: 'getChannel',
    value: function getChannel(name) {
      return this._channelStorage.get(name);
    }
  }, {
    key: 'getChannelGroup',
    value: function getChannelGroup(name) {
      return this._channelGroupStorage.get(name);
    }
  }, {
    key: 'addChannel',
    value: function addChannel(name, metadata) {
      this._channelStorage.set(name, metadata);
    }
  }, {
    key: 'addChannelGroup',
    value: function addChannelGroup(name, metadata) {
      this._channelGroupStorage.set(name, metadata);
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
      this._channelStorage.forEach(function (status, channel) {
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
      this._channelGroupStorage.forEach(function (status, channel_group) {
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
