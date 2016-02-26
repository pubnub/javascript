'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = require('../utils');

var _class = function () {
  function _class(xdr, subscribeKey, publishKey) {
    _classCallCheck(this, _class);

    this.xdr = xdr;
    this.subscribeKey = subscribeKey;
    this.publishKey = publishKey;

    this.maxHostNumber = 20;
    this.currentOrigin = Math.floor(Math.random() * this.maxHostNumber);
  }

  _createClass(_class, [{
    key: 'nextOrigin',
    value: function nextOrigin(origin, failover) {
      // if a custom origin is supplied, use do not bother with shuffling subdomains
      if (origin.indexOf('pubsub.') === -1) {
        return origin;
      }

      var newSubdomain = undefined;

      if (failover) {
        newSubdomain = utils.generateUUID().split('-')[0];
      } else {
        this.currentOrigin = this.currentOrigin + 1;

        if (this.currentOrigin >= this.maxHostNumber) {
          this.currentOrigin = 1;
        }

        newSubdomain = this.currentOrigin.toString();
      }

      return origin.replace('pubsub', 'ps' + newSubdomain);
    }

    // method based URL's

  }, {
    key: 'fetchHistory',
    value: function fetchHistory(STD_ORIGIN, channel, _ref) {
      var data = _ref.data;
      var callback = _ref.callback;
      var success = _ref.success;
      var fail = _ref.fail;

      var url = [STD_ORIGIN, 'v2', 'history', 'sub-key', this.getSubscribeKey(), 'channel', utils.encode(channel)];

      this.xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchReplay',
    value: function fetchReplay(STD_ORIGIN, source, destination, _ref2) {
      var data = _ref2.data;
      var callback = _ref2.callback;
      var success = _ref2.success;
      var fail = _ref2.fail;

      var url = [STD_ORIGIN, 'v1', 'replay', this.getPublishKey(), this.getSubscribeKey(), source, destination];

      this.xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
    }
  }, {
    key: 'fetchTime',
    value: function fetchTime(STD_ORIGIN, jsonp, _ref3) {
      var data = _ref3.data;
      var callback = _ref3.callback;
      var success = _ref3.success;
      var fail = _ref3.fail;

      var url = [STD_ORIGIN, 'time', jsonp];

      this.xdr({ data: data, callback: callback, success: success, fail: fail, url: url });
    }

    // getters

  }, {
    key: 'getSubscribeKey',
    value: function getSubscribeKey() {
      return this.subscribeKey;
    }
  }, {
    key: 'getPublishKey',
    value: function getPublishKey() {
      return this.publishKey;
    }
  }]);

  return _class;
}();

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=networking.js.map
