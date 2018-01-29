'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pubnubCommon = require('../core/pubnub-common');

var _pubnubCommon2 = _interopRequireDefault(_pubnubCommon);

var _networking = require('../networking');

var _networking2 = _interopRequireDefault(_networking);

var _common = require('../db/common');

var _common2 = _interopRequireDefault(_common);

var _webNode = require('../networking/modules/web-node');

var _node = require('../networking/modules/node');

var _flow_interfaces = require('../core/flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _class = function (_PubNubCore) {
  _inherits(_class, _PubNubCore);

  function _class(setup) {
    _classCallCheck(this, _class);

    setup.db = new _common2.default();
    setup.networking = new _networking2.default({ keepAlive: _node.keepAlive, del: _webNode.del, get: _webNode.get, post: _webNode.post, proxy: _node.proxy });
    setup.sdkFamily = 'Nodejs';

    if (!('ssl' in setup)) {
      setup.ssl = true;
    }

    return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, setup));
  }

  return _class;
}(_pubnubCommon2.default);

exports.default = _class;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
