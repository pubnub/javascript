'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _networking = require('../components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _keychain = require('../components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _responders = require('../presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
  function _class(_ref) {
    var networking = _ref.networking;
    var keychain = _ref.keychain;
    var error = _ref.error;

    _classCallCheck(this, _class);

    this._networking = networking;
    this._keychain = keychain;
    this._error = error;
  }

  _createClass(_class, [{
    key: 'performReplay',
    value: function performReplay(args, argumentCallback) {
      var stop = args.stop;
      var start = args.start;
      var end = args.end;
      var reverse = args.reverse;
      var limit = args.limit;
      var source = args.source;


      var callback = argumentCallback || args.callback || function () {};
      var auth_key = args.auth_key || this._keychain.getAuthKey();
      var destination = args.destination;
      var err = args.error || function () {};
      var data = {};

      // Check User Input
      if (!source) return this._error('Missing Source Channel');
      if (!destination) return this._error('Missing Destination Channel');
      if (!this._keychain.getPublishKey()) return this._error('Missing Publish Key');
      if (!this._keychain.getSubscribeKey()) return this._error('Missing Subscribe Key');

      // Setup URL Params
      if (stop) data.stop = 'all';
      if (reverse) data.reverse = 'true';
      if (start) data.start = start;
      if (end) data.end = end;
      if (limit) data.count = limit;

      data.auth = auth_key;

      // Start (or Stop) Replay!
      this._networking.fetchReplay(source, destination, {
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
        },
        fail: function fail() {
          callback([0, 'Disconnected']);
        },
        data: this._networking.prepareParams(data)
      });
    }
  }]);

  return _class;
}();

exports.default = _class;
//# sourceMappingURL=replay.js.map
