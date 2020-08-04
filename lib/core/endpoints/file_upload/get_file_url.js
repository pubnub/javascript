"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _endpoint = require("../../components/endpoint");

var _default = function _default(_ref, _ref2) {
  var config = _ref.config;
  var channel = _ref2.channel,
      id = _ref2.id,
      name = _ref2.name;

  if (!channel) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("channel can't be empty"));
  }

  if (!id) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("file id can't be empty"));
  }

  if (!name) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("file name can't be empty"));
  }

  return "".concat(config.origin, "/v1/files/").concat(config.subscribeKey, "/channels/").concat(channel, "/files/").concat(id, "/").concat(name);
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=get_file_url.js.map
