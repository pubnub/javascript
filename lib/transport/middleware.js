"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubMiddleware = exports.RequestSignature = void 0;
var transport_request_1 = require("../core/types/transport-request");
var utils_1 = require("../core/utils");
var RequestSignature = /** @class */ (function () {
    function RequestSignature(publishKey, secretKey, hasher) {
        this.publishKey = publishKey;
        this.secretKey = secretKey;
        this.hasher = hasher;
    }
    /**
     * Compute request signature.
     *
     * @param req - Request which will be used to compute signature.
     * @returns {string} `v2` request signature.
     */
    RequestSignature.prototype.signature = function (req) {
        var method = req.path.startsWith('/publish') ? transport_request_1.TransportMethod.GET : req.method;
        var signatureInput = "".concat(method, "\n").concat(this.publishKey, "\n").concat(req.path, "\n").concat(this.queryParameters(req.queryParameters), "\n");
        if (method === transport_request_1.TransportMethod.POST || method === transport_request_1.TransportMethod.PATCH) {
            var body = req.body;
            var payload = void 0;
            if (body && body instanceof ArrayBuffer) {
                payload = RequestSignature.textDecoder.decode(body);
            }
            else if (body && typeof body !== 'object') {
                payload = body;
            }
            if (payload)
                signatureInput += payload;
        }
        return "v2.".concat(this.hasher(signatureInput, this.secretKey))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    };
    /**
     * Prepare request query parameters for signature.
     *
     * @param query - Key / value pair of the request query parameters.
     * @private
     */
    RequestSignature.prototype.queryParameters = function (query) {
        return Object.keys(query)
            .sort()
            .map(function (key) {
            var queryValue = query[key];
            if (!Array.isArray(queryValue))
                return "".concat(key, "=").concat((0, utils_1.encodeString)(queryValue));
            return queryValue
                .sort()
                .map(function (value) { return "".concat(key, "=").concat((0, utils_1.encodeString)(value)); })
                .join('&');
        })
            .join('&');
    };
    RequestSignature.textDecoder = new TextDecoder('utf-8');
    return RequestSignature;
}());
exports.RequestSignature = RequestSignature;
var PubNubMiddleware = /** @class */ (function () {
    function PubNubMiddleware(configuration) {
        this.configuration = configuration;
        var keySet = configuration.clientConfiguration.keySet, shaHMAC = configuration.shaHMAC;
        if (keySet.secretKey && shaHMAC)
            this.signatureGenerator = new RequestSignature(keySet.publishKey, keySet.secretKey, shaHMAC);
    }
    PubNubMiddleware.prototype.makeSendable = function (req) {
        return this.configuration.transport.makeSendable(this.request(req));
    };
    PubNubMiddleware.prototype.request = function (req) {
        var _a;
        var clientConfiguration = this.configuration.clientConfiguration;
        if (!req.queryParameters)
            req.queryParameters = {};
        // Modify request with required information.
        if (clientConfiguration.useInstanceId)
            req.queryParameters['instanceid'] = clientConfiguration.instanceId;
        if (!req.queryParameters['uuid'])
            req.queryParameters['uuid'] = clientConfiguration.userId;
        req.queryParameters['requestid'] = req.identifier;
        req.queryParameters['pnsdk'] = this.generatePNSDK();
        (_a = req.origin) !== null && _a !== void 0 ? _a : (req.origin = clientConfiguration.origin);
        // Authenticate request if required.
        this.authenticateRequest(req);
        // Sign request if it is required.
        this.signRequest(req);
        return req;
    };
    PubNubMiddleware.prototype.authenticateRequest = function (req) {
        var _a;
        // Access management endpoints doesn't need authentication (signature required instead).
        if (req.path.startsWith('/v2/auth/') || req.path.startsWith('/v3/pam/') || req.path.startsWith('/time'))
            return;
        var _b = this.configuration, clientConfiguration = _b.clientConfiguration, tokenManager = _b.tokenManager;
        var accessKey = (_a = tokenManager.getToken()) !== null && _a !== void 0 ? _a : clientConfiguration.authKey;
        if (accessKey)
            req.queryParameters['auth'] = accessKey;
    };
    /**
     * Compute and append request signature.
     *
     * @param req - Transport request with information which should be used to generate signature.
     */
    PubNubMiddleware.prototype.signRequest = function (req) {
        if (!this.signatureGenerator || req.path.startsWith('/time'))
            return;
        req.queryParameters['timestamp'] = String(Math.floor(new Date().getTime() / 1000));
        req.queryParameters['signature'] = this.signatureGenerator.signature(req);
    };
    /**
     * Compose `pnsdk` query parameter.
     *
     * SDK provides ability to set custom name or append vendor information to the `pnsdk` query
     * parameter.
     *
     * @returns Finalized `pnsdk` query parameter value.
     */
    PubNubMiddleware.prototype.generatePNSDK = function () {
        var clientConfiguration = this.configuration.clientConfiguration;
        if (clientConfiguration.sdkName)
            return clientConfiguration.sdkName;
        var base = "PubNub-JS-".concat(clientConfiguration.sdkFamily);
        if (clientConfiguration.partnerId)
            base += "-".concat(clientConfiguration.partnerId);
        base += "/".concat(clientConfiguration.version);
        var pnsdkSuffix = clientConfiguration._getPnsdkSuffix(' ');
        if (pnsdkSuffix.length > 0)
            base += pnsdkSuffix;
        return base;
    };
    return PubNubMiddleware;
}());
exports.PubNubMiddleware = PubNubMiddleware;
