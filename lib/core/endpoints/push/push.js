"use strict";
/**
 * Manage channels enabled for device push REST API module.
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePushNotificationChannelsRequest = void 0;
var request_1 = require("../../components/request");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Environment for which APNS2 notifications
 */
var ENVIRONMENT = 'development';
/**
 * Maximum number of channels in `list` response.
 */
var MAX_COUNT = 1000;
// endregion
/**
 * Base push notification request.
 */
var BasePushNotificationChannelsRequest = /** @class */ (function (_super) {
    __extends(BasePushNotificationChannelsRequest, _super);
    function BasePushNotificationChannelsRequest(parameters) {
        var _a;
        var _b;
        var _this = _super.call(this) || this;
        _this.parameters = parameters;
        // Apply request defaults
        if (_this.parameters.pushGateway === 'apns2')
            (_a = (_b = _this.parameters).environment) !== null && _a !== void 0 ? _a : (_b.environment = ENVIRONMENT);
        if (_this.parameters.count && _this.parameters.count > MAX_COUNT)
            _this.parameters.count = MAX_COUNT;
        return _this;
    }
    BasePushNotificationChannelsRequest.prototype.operation = function () {
        throw Error('Should be implemented in subclass.');
    };
    BasePushNotificationChannelsRequest.prototype.validate = function () {
        var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, action = _a.action, device = _a.device, pushGateway = _a.pushGateway;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!device)
            return 'Missing Device ID (device)';
        if ((action === 'add' || action === 'remove') &&
            (!('channels' in this.parameters) || this.parameters.channels.length === 0))
            return 'Missing Channels';
        if (!pushGateway)
            return 'Missing GW Type (pushGateway: gcm or apns2)';
        if (this.parameters.pushGateway === 'apns2' && !this.parameters.topic)
            return 'Missing APNS2 topic';
    };
    BasePushNotificationChannelsRequest.prototype.parse = function (_response) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw Error('Should be implemented in subclass.');
            });
        });
    };
    Object.defineProperty(BasePushNotificationChannelsRequest.prototype, "path", {
        get: function () {
            var _a = this.parameters, subscribeKey = _a.keySet.subscribeKey, action = _a.action, device = _a.device, pushGateway = _a.pushGateway;
            var path = pushGateway === 'apns2'
                ? "/v2/push/sub-key/".concat(subscribeKey, "/devices-apns2/").concat(device)
                : "/v1/push/sub-key/".concat(subscribeKey, "/devices/").concat(device);
            if (action === 'remove-device')
                path = "".concat(path, "/remove");
            return path;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BasePushNotificationChannelsRequest.prototype, "queryParameters", {
        get: function () {
            var _a = this.parameters, start = _a.start, count = _a.count;
            var query = __assign(__assign({ type: this.parameters.pushGateway }, (start ? { start: start } : {})), (count && count > 0 ? { count: count } : {}));
            if ('channels' in this.parameters)
                query[this.parameters.action] = this.parameters.channels.join(',');
            if (this.parameters.pushGateway === 'apns2') {
                var _b = this.parameters, environment = _b.environment, topic = _b.topic;
                query = __assign(__assign({}, query), { environment: environment, topic: topic });
            }
            return query;
        },
        enumerable: false,
        configurable: true
    });
    return BasePushNotificationChannelsRequest;
}(request_1.AbstractRequest));
exports.BasePushNotificationChannelsRequest = BasePushNotificationChannelsRequest;
