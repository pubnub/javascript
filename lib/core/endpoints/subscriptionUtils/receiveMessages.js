"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNReceiveMessagesOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params !== null && params !== void 0 && params.channels) && !(params !== null && params !== void 0 && params.channelGroups)) {
      return 'channels and channleGroups both should not be empty';
    }

    if (!(params !== null && params !== void 0 && params.timetoken)) {
      return 'timetoken can not be empty';
    }

    if (!(params !== null && params !== void 0 && params.region)) {
      return 'region can not be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    var channelsString = params.channels ? params.channels.join(',') : ',';
    return "/v2/subscribe/".concat(config.subscribeKey, "/").concat(_utils["default"].encodeString(channelsString), "/0");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getSubscribeTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  prepareParams: function prepareParams(_, params) {
    var outParams = {};

    if (params.channelGroups) {
      outParams['channel-group'] = params.channelGroups.join(',');
    }

    outParams.tt = params.timetoken;
    outParams.tr = params.region;
    return outParams;
  },
  handleResponse: function () {
    var _handleResponse = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(_, response) {
      var parsedMessages;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              parsedMessages = [];
              response.m.forEach(function (message) {
                var envelope = {
                  shard: parseInt(message.a, 10),
                  subscriptionMatch: message.b,
                  channel: message.c,
                  messageType: message.e,
                  payload: message.d,
                  flags: message.f,
                  issuingClientId: message.i,
                  subscribeKey: message.k,
                  originationTimetoken: message.o,
                  userMetadata: message.u,
                  publishMetaData: {
                    timetoken: message.p.t,
                    region: message.p.r
                  }
                };
                parsedMessages.push(envelope);
              });
              return _context.abrupt("return", {
                messages: parsedMessages,
                metadata: {
                  region: response.t.r,
                  timetoken: response.t.t
                }
              });

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    function handleResponse(_x, _x2) {
      return _handleResponse.apply(this, arguments);
    }

    return handleResponse;
  }()
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=receiveMessages.js.map
