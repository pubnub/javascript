'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lilUuid = require('lil-uuid');

var _lilUuid2 = _interopRequireDefault(_lilUuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  createUUID: function createUUID() {
    if (_lilUuid2.default.uuid) {
      return _lilUuid2.default.uuid();
    } else {
      return (0, _lilUuid2.default)();
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=uuid.js.map
