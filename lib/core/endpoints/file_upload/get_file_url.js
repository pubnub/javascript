"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _endpoint = require("../../components/endpoint");

var _utils = _interopRequireDefault(require("../../utils"));

var _default = function _default(modules, _ref) {
  var channel = _ref.channel,
      id = _ref.id,
      name = _ref.name;
  var config = modules.config,
      networking = modules.networking;

  if (!channel) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("channel can't be empty"));
  }

  if (!id) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("file id can't be empty"));
  }

  if (!name) {
    throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("file name can't be empty"));
  }

  var url = "/v1/files/".concat(config.subscribeKey, "/channels/").concat(_utils["default"].encodeString(channel), "/files/").concat(id, "/").concat(name);
  var params = {};
  params.uuid = config.getUUID();
  params.pnsdk = (0, _endpoint.generatePNSDK)(config);

  if (config.getAuthKey()) {
    params.auth = config.getAuthKey();
  }

  if (config.secretKey) {
    (0, _endpoint.signRequest)(modules, url, params, {}, {
      getOperation: function getOperation() {
        return 'PubNubGetFileUrlOperation';
      }
    });
  }

  var queryParams = Object.keys(params).map(function (key) {
    return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(params[key]));
  }).join('&');

  if (queryParams !== '') {
    return "".concat(networking.getStandardOrigin()).concat(url, "?").concat(queryParams);
  }

  return "".concat(networking.getStandardOrigin()).concat(url);
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=get_file_url.js.map
