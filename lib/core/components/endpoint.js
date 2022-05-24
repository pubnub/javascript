"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signRequest = exports.generatePNSDK = exports.createValidationError = exports.PubNubError = void 0;
var uuid_1 = __importDefault(require("./uuid"));
var utils_1 = __importDefault(require("../utils"));
var operations_1 = __importDefault(require("../constants/operations"));
var categories_1 = __importDefault(require("../constants/categories"));
var PubNubError = /** @class */ (function (_super) {
    __extends(PubNubError, _super);
    function PubNubError(message, status) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, message) || this;
        _this.name = _this.constructor.name;
        _this.status = status;
        _this.message = message;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        return _this;
    }
    return PubNubError;
}(Error));
exports.PubNubError = PubNubError;
function createError(errorPayload, type) {
    errorPayload.type = type;
    errorPayload.error = true;
    return errorPayload;
}
function createValidationError(message) {
    return createError({ message: message }, 'validationError');
}
exports.createValidationError = createValidationError;
function decideURL(endpoint, modules, incomingParams) {
    if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
        return endpoint.postURL(modules, incomingParams);
    }
    if (endpoint.usePatch && endpoint.usePatch(modules, incomingParams)) {
        return endpoint.patchURL(modules, incomingParams);
    }
    if (endpoint.useGetFile && endpoint.useGetFile(modules, incomingParams)) {
        return endpoint.getFileURL(modules, incomingParams);
    }
    return endpoint.getURL(modules, incomingParams);
}
function generatePNSDK(config) {
    if (config.sdkName) {
        return config.sdkName;
    }
    var base = "PubNub-JS-".concat(config.sdkFamily);
    if (config.partnerId) {
        base += "-".concat(config.partnerId);
    }
    base += "/".concat(config.getVersion());
    var pnsdkSuffix = config._getPnsdkSuffix(' ');
    if (pnsdkSuffix.length > 0) {
        base += pnsdkSuffix;
    }
    return base;
}
exports.generatePNSDK = generatePNSDK;
function getHttpMethod(modules, endpoint, incomingParams) {
    if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
        return 'POST';
    }
    if (endpoint.usePatch && endpoint.usePatch(modules, incomingParams)) {
        return 'PATCH';
    }
    if (endpoint.useDelete && endpoint.useDelete(modules, incomingParams)) {
        return 'DELETE';
    }
    if (endpoint.useGetFile && endpoint.useGetFile(modules, incomingParams)) {
        return 'GETFILE';
    }
    return 'GET';
}
function signRequest(modules, url, outgoingParams, incomingParams, endpoint) {
    var config = modules.config, crypto = modules.crypto;
    var httpMethod = getHttpMethod(modules, endpoint, incomingParams);
    outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
    // This is because of a server-side bug, old publish using post should be deprecated
    if (endpoint.getOperation() === 'PNPublishOperation' &&
        endpoint.usePost &&
        endpoint.usePost(modules, incomingParams)) {
        httpMethod = 'GET';
    }
    if (httpMethod === 'GETFILE') {
        httpMethod = 'GET';
    }
    var signInput = "".concat(httpMethod, "\n").concat(config.publishKey, "\n").concat(url, "\n").concat(utils_1.default.signPamFromParams(outgoingParams), "\n");
    if (httpMethod === 'POST') {
        var payload = endpoint.postPayload(modules, incomingParams);
        if (typeof payload === 'string') {
            signInput += payload;
        }
        else {
            signInput += JSON.stringify(payload);
        }
    }
    else if (httpMethod === 'PATCH') {
        var payload = endpoint.patchPayload(modules, incomingParams);
        if (typeof payload === 'string') {
            signInput += payload;
        }
        else {
            signInput += JSON.stringify(payload);
        }
    }
    var signature = "v2.".concat(crypto.HMACSHA256(signInput));
    signature = signature.replace(/\+/g, '-');
    signature = signature.replace(/\//g, '_');
    signature = signature.replace(/=+$/, '');
    outgoingParams.signature = signature;
}
exports.signRequest = signRequest;
function default_1(modules, endpoint) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var networking = modules.networking, config = modules.config, telemetryManager = modules.telemetryManager, tokenManager = modules.tokenManager;
    var requestId = uuid_1.default.createUUID();
    var callback = null;
    var promiseComponent = null;
    var incomingParams = {};
    if (endpoint.getOperation() === operations_1.default.PNTimeOperation ||
        endpoint.getOperation() === operations_1.default.PNChannelGroupsOperation) {
        callback = args[0];
    }
    else {
        incomingParams = args[0];
        callback = args[1];
    }
    // bridge in Promise support.
    if (typeof Promise !== 'undefined' && !callback) {
        promiseComponent = utils_1.default.createPromise();
    }
    var validationResult = endpoint.validateParams(modules, incomingParams);
    if (validationResult) {
        if (callback) {
            return callback(createValidationError(validationResult));
        }
        if (promiseComponent) {
            promiseComponent.reject(new PubNubError('Validation failed, check status for details', createValidationError(validationResult)));
            return promiseComponent.promise;
        }
        return;
    }
    var outgoingParams = endpoint.prepareParams(modules, incomingParams);
    var url = decideURL(endpoint, modules, incomingParams);
    var callInstance;
    var networkingParams = {
        url: url,
        operation: endpoint.getOperation(),
        timeout: endpoint.getRequestTimeout(modules),
        headers: endpoint.getRequestHeaders ? endpoint.getRequestHeaders() : {},
        ignoreBody: typeof endpoint.ignoreBody === 'function' ? endpoint.ignoreBody(modules) : false,
        forceBuffered: typeof endpoint.forceBuffered === 'function' ? endpoint.forceBuffered(modules, incomingParams) : null,
        abortSignal: typeof endpoint.getAbortSignal === 'function' ? endpoint.getAbortSignal(modules, incomingParams) : null,
    };
    outgoingParams.uuid = config.UUID;
    outgoingParams.pnsdk = generatePNSDK(config);
    // Add telemetry information (if there is any available).
    var telemetryLatencies = telemetryManager.operationsLatencyForRequest();
    if (Object.keys(telemetryLatencies).length) {
        outgoingParams = __assign(__assign({}, outgoingParams), telemetryLatencies);
    }
    if (config.useInstanceId) {
        outgoingParams.instanceid = config.instanceId;
    }
    if (config.useRequestId) {
        outgoingParams.requestid = requestId;
    }
    if (endpoint.isAuthSupported()) {
        var tokenOrKey = tokenManager.getToken() || config.getAuthKey();
        if (tokenOrKey) {
            outgoingParams.auth = tokenOrKey;
        }
    }
    if (config.secretKey) {
        signRequest(modules, url, outgoingParams, incomingParams, endpoint);
    }
    var onResponse = function (status, payload) {
        if (status.error) {
            if (endpoint.handleError) {
                endpoint.handleError(modules, incomingParams, status);
            }
            if (callback) {
                callback(status);
            }
            else if (promiseComponent) {
                promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', status));
            }
            return;
        }
        // Stop endpoint latency tracking.
        telemetryManager.stopLatencyMeasure(endpoint.getOperation(), requestId);
        var responseP = endpoint.handleResponse(modules, payload, incomingParams);
        if (typeof (responseP === null || responseP === void 0 ? void 0 : responseP.then) !== 'function') {
            responseP = Promise.resolve(responseP);
        }
        responseP
            .then(function (result) {
            if (callback) {
                callback(status, result);
            }
            else if (promiseComponent) {
                promiseComponent.fulfill(result);
            }
        })
            .catch(function (e) {
            if (callback) {
                var errorData = e;
                if (endpoint.getOperation() === operations_1.default.PNSubscribeOperation) {
                    errorData = {
                        statusCode: 400,
                        error: true,
                        operation: endpoint.getOperation(),
                        errorData: e,
                        category: categories_1.default.PNUnknownCategory,
                    };
                }
                callback(errorData, null);
            }
            else if (promiseComponent) {
                promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', e));
            }
        });
    };
    // Start endpoint latency tracking.
    telemetryManager.startLatencyMeasure(endpoint.getOperation(), requestId);
    if (getHttpMethod(modules, endpoint, incomingParams) === 'POST') {
        var payload = endpoint.postPayload(modules, incomingParams);
        callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
    }
    else if (getHttpMethod(modules, endpoint, incomingParams) === 'PATCH') {
        var payload = endpoint.patchPayload(modules, incomingParams);
        callInstance = networking.PATCH(outgoingParams, payload, networkingParams, onResponse);
    }
    else if (getHttpMethod(modules, endpoint, incomingParams) === 'DELETE') {
        callInstance = networking.DELETE(outgoingParams, networkingParams, onResponse);
    }
    else if (getHttpMethod(modules, endpoint, incomingParams) === 'GETFILE') {
        callInstance = networking.GETFILE(outgoingParams, networkingParams, onResponse);
    }
    else {
        callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
    }
    if (endpoint.getOperation() === operations_1.default.PNSubscribeOperation) {
        return callInstance;
    }
    if (promiseComponent) {
        return promiseComponent.promise;
    }
}
exports.default = default_1;
