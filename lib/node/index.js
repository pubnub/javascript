'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pubnubCommon = require('../core/pubnub-common.js');

var _pubnubCommon2 = _interopRequireDefault(_pubnubCommon);

var _flow_interfaces = require('../core/flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Database = function () {
  function Database() {
    _classCallCheck(this, Database);

    this.storage = {};
  }

  _createClass(Database, [{
    key: 'get',
    value: function get(key) {
      return this.storage[key];
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      this.storage[key] = value;
    }
  }]);

  return Database;
}();

var _class2 = function (_PubNubCore) {
  _inherits(_class2, _PubNubCore);

  function _class2(setup) {
    _classCallCheck(this, _class2);

    setup.db = new Database();
    setup.sdkFamily = 'Nodejs';
    return _possibleConstructorReturn(this, Object.getPrototypeOf(_class2).call(this, setup));
  }

  return _class2;
}(_pubnubCommon2.default);

exports.default = _class2;
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
