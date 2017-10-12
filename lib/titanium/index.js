'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _pubnubCommon = require('../core/pubnub-common');

var _pubnubCommon2 = _interopRequireDefault(_pubnubCommon);

var _networking = require('../networking');

var _networking2 = _interopRequireDefault(_networking);

var _common = require('../db/common');

var _common2 = _interopRequireDefault(_common);

var _titanium = require('../networking/modules/titanium');

var _flow_interfaces = require('../core/flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PubNub = function (_PubNubCore) {
  _inherits(PubNub, _PubNubCore);

  function PubNub(setup) {
    _classCallCheck(this, PubNub);

    setup.db = new _common2.default();
    setup.sdkFamily = 'TitaniumSDK';
    setup.networking = new _networking2.default({ del: _titanium.del, get: _titanium.get, post: _titanium.post });

    return _possibleConstructorReturn(this, (PubNub.__proto__ || Object.getPrototypeOf(PubNub)).call(this, setup));
  }

  return PubNub;
}(_pubnubCommon2.default);

exports.default = PubNub;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
