'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var state = _ref.state;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._state = state;
    this._l = _logger2.default.getLogger('#endpoints/publish');

    this._state.onSubscriptionChange(this.start.bind(this));
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
      var timetoken = this._state.getSubscribeTimeToken();
      var callback = this.__handleSubscribeResponse.bind(this);

      this._networking.performSubscribe(stringifiedChannels, timetoken, data, callback);
    }
  }, {
    key: '__handleSubscribeResponse',
    value: function __handleSubscribeResponse(err, response) {
      if (err) {
        console.log(err);
        return;
      }

      var _response = _slicedToArray(response, 2);

      var payload = _response[0];
      var timetoken = _response[1];


      console.log('subscribe callback', payload, timetoken);
      this._state.setSubscribeTimeToken(timetoken);
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