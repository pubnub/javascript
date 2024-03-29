"use strict";
/**
 * Receive messages subscribe REST API module.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveMessagesSubscribeRequest = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
var subscribe_1 = require("../subscribe");
var utils_1 = require("../../utils");
/**
 * Receive messages subscribe request.
 */
var ReceiveMessagesSubscribeRequest = /** @class */ (function (_super) {
    __extends(ReceiveMessagesSubscribeRequest, _super);
    function ReceiveMessagesSubscribeRequest() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReceiveMessagesSubscribeRequest.prototype.operation = function () {
        return operations_1.default.PNReceiveMessagesOperation;
    };
    ReceiveMessagesSubscribeRequest.prototype.validate = function () {
        var validationResult = _super.prototype.validate.call(this);
        if (validationResult)
            return validationResult;
        if (!this.parameters.timetoken)
            return 'timetoken can not be empty';
        if (!this.parameters.region)
            return 'region can not be empty';
    };
    Object.defineProperty(ReceiveMessagesSubscribeRequest.prototype, "path", {
        get: function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, channels = _a.channels;
            return "/v2/subscribe/".concat(subscribeKey, "/").concat((0, utils_1.encodeString)(channels.length > 0 ? channels.join(',') : ','), "/0");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReceiveMessagesSubscribeRequest.prototype, "queryParameters", {
        get: function () {
            var _a = this.parameters, channelGroups = _a.channelGroups, filterExpression = _a.filterExpression, timetoken = _a.timetoken, region = _a.region;
            var query = { ee: '' };
            if (channelGroups && channelGroups.length > 0)
                query['channel-group'] = channelGroups.join(',');
            if (filterExpression && filterExpression.length > 0)
                query['filter-expr'] = filterExpression;
            if (typeof timetoken === 'string') {
                if (timetoken && timetoken.length > 0)
                    query['tt'] = timetoken;
            }
            else if (timetoken && timetoken > 0)
                query['tt'] = timetoken;
            if (region)
                query['tr'] = region;
            return query;
        },
        enumerable: false,
        configurable: true
    });
    return ReceiveMessagesSubscribeRequest;
}(subscribe_1.BaseSubscribeRequest));
exports.ReceiveMessagesSubscribeRequest = ReceiveMessagesSubscribeRequest;
