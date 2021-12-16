"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _operations = _interopRequireDefault(require("../constants/operations"));

var _default = function () {
  function _default(configuration) {
    (0, _classCallCheck2["default"])(this, _default);
    (0, _defineProperty2["default"])(this, "_maximumSamplesCount", 100);
    (0, _defineProperty2["default"])(this, "_trackedLatencies", {});
    (0, _defineProperty2["default"])(this, "_latencies", {});
    this._maximumSamplesCount = configuration.maximumSamplesCount || this._maximumSamplesCount;
  }

  (0, _createClass2["default"])(_default, [{
    key: "operationsLatencyForRequest",
    value: function operationsLatencyForRequest() {
      var _this = this;

      var latencies = {};
      Object.keys(this._latencies).forEach(function (endpointName) {
        var operationLatencies = _this._latencies[endpointName];

        var averageLatency = _this._averageLatency(operationLatencies);

        if (averageLatency > 0) {
          latencies["l_".concat(endpointName)] = averageLatency;
        }
      });
      return latencies;
    }
  }, {
    key: "startLatencyMeasure",
    value: function startLatencyMeasure(operationType, identifier) {
      if (operationType === _operations["default"].PNSubscribeOperation || !identifier) {
        return;
      }

      this._trackedLatencies[identifier] = Date.now();
    }
  }, {
    key: "stopLatencyMeasure",
    value: function stopLatencyMeasure(operationType, identifier) {
      if (operationType === _operations["default"].PNSubscribeOperation || !identifier) {
        return;
      }

      var endpointName = this._endpointName(operationType);

      var endpointLatencies = this._latencies[endpointName];
      var startDate = this._trackedLatencies[identifier];

      if (!endpointLatencies) {
        endpointLatencies = this._latencies[endpointName] = [];
      }

      endpointLatencies.push(Date.now() - startDate);

      if (endpointLatencies.length > this._maximumSamplesCount) {
        endpointLatencies.splice(0, endpointLatencies.length - this._maximumSamplesCount);
      }

      delete this._trackedLatencies[identifier];
    }
  }, {
    key: "_averageLatency",
    value: function _averageLatency(latencies) {
      var arrayReduce = function arrayReduce(accumulatedLatency, latency) {
        return accumulatedLatency + latency;
      };

      return Math.floor(latencies.reduce(arrayReduce, 0) / latencies.length);
    }
  }, {
    key: "_endpointName",
    value: function _endpointName(operationType) {
      var operation = null;

      switch (operationType) {
        case _operations["default"].PNPublishOperation:
          operation = 'pub';
          break;

        case _operations["default"].PNSignalOperation:
          operation = 'sig';
          break;

        case _operations["default"].PNHistoryOperation:
        case _operations["default"].PNFetchMessagesOperation:
        case _operations["default"].PNDeleteMessagesOperation:
        case _operations["default"].PNMessageCounts:
          operation = 'hist';
          break;

        case _operations["default"].PNUnsubscribeOperation:
        case _operations["default"].PNWhereNowOperation:
        case _operations["default"].PNHereNowOperation:
        case _operations["default"].PNHeartbeatOperation:
        case _operations["default"].PNSetStateOperation:
        case _operations["default"].PNGetStateOperation:
          operation = 'pres';
          break;

        case _operations["default"].PNAddChannelsToGroupOperation:
        case _operations["default"].PNRemoveChannelsFromGroupOperation:
        case _operations["default"].PNChannelGroupsOperation:
        case _operations["default"].PNRemoveGroupOperation:
        case _operations["default"].PNChannelsForGroupOperation:
          operation = 'cg';
          break;

        case _operations["default"].PNPushNotificationEnabledChannelsOperation:
        case _operations["default"].PNRemoveAllPushNotificationsOperation:
          operation = 'push';
          break;

        case _operations["default"].PNCreateUserOperation:
        case _operations["default"].PNUpdateUserOperation:
        case _operations["default"].PNDeleteUserOperation:
        case _operations["default"].PNGetUserOperation:
        case _operations["default"].PNGetUsersOperation:
        case _operations["default"].PNCreateSpaceOperation:
        case _operations["default"].PNUpdateSpaceOperation:
        case _operations["default"].PNDeleteSpaceOperation:
        case _operations["default"].PNGetSpaceOperation:
        case _operations["default"].PNGetSpacesOperation:
        case _operations["default"].PNGetMembersOperation:
        case _operations["default"].PNUpdateMembersOperation:
        case _operations["default"].PNGetMembershipsOperation:
        case _operations["default"].PNUpdateMembershipsOperation:
          operation = 'obj';
          break;

        case _operations["default"].PNAddMessageActionOperation:
        case _operations["default"].PNRemoveMessageActionOperation:
        case _operations["default"].PNGetMessageActionsOperation:
          operation = 'msga';
          break;

        case _operations["default"].PNAccessManagerGrant:
        case _operations["default"].PNAccessManagerAudit:
          operation = 'pam';
          break;

        case _operations["default"].PNAccessManagerGrantToken:
        case _operations["default"].PNAccessManagerRevokeToken:
          operation = 'pamv3';
          break;

        default:
          operation = 'time';
          break;
      }

      return operation;
    }
  }]);
  return _default;
}();

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=telemetry_manager.js.map
