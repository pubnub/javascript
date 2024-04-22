"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubMiddleware = exports.RequestSignature = void 0;
const transport_request_1 = require("../core/types/transport-request");
const utils_1 = require("../core/utils");
class RequestSignature {
    constructor(publishKey, secretKey, hasher) {
        this.publishKey = publishKey;
        this.secretKey = secretKey;
        this.hasher = hasher;
    }
    signature(req) {
        const method = req.path.startsWith('/publish') ? transport_request_1.TransportMethod.GET : req.method;
        let signatureInput = `${method}\n${this.publishKey}\n${req.path}\n${this.queryParameters(req.queryParameters)}\n`;
        if (method === transport_request_1.TransportMethod.POST || method === transport_request_1.TransportMethod.PATCH) {
            const body = req.body;
            let payload;
            if (body && body instanceof ArrayBuffer) {
                payload = RequestSignature.textDecoder.decode(body);
            }
            else if (body && typeof body !== 'object') {
                payload = body;
            }
            if (payload)
                signatureInput += payload;
        }
        return `v2.${this.hasher(signatureInput, this.secretKey)}`
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    queryParameters(query) {
        return Object.keys(query)
            .sort()
            .map((key) => {
            const queryValue = query[key];
            if (!Array.isArray(queryValue))
                return `${key}=${(0, utils_1.encodeString)(queryValue)}`;
            return queryValue
                .sort()
                .map((value) => `${key}=${(0, utils_1.encodeString)(value)}`)
                .join('&');
        })
            .join('&');
    }
}
exports.RequestSignature = RequestSignature;
RequestSignature.textDecoder = new TextDecoder('utf-8');
class PubNubMiddleware {
    constructor(configuration) {
        this.configuration = configuration;
        const { clientConfiguration: { keySet }, shaHMAC, } = configuration;
        if (keySet.secretKey && shaHMAC)
            this.signatureGenerator = new RequestSignature(keySet.publishKey, keySet.secretKey, shaHMAC);
    }
    makeSendable(req) {
        return this.configuration.transport.makeSendable(this.request(req));
    }
    request(req) {
        var _a;
        const { clientConfiguration } = this.configuration;
        req = this.configuration.transport.request(req);
        if (!req.queryParameters)
            req.queryParameters = {};
        if (clientConfiguration.useInstanceId)
            req.queryParameters['instanceid'] = clientConfiguration.instanceId;
        if (!req.queryParameters['uuid'])
            req.queryParameters['uuid'] = clientConfiguration.userId;
        if (clientConfiguration.useRequestId)
            req.queryParameters['requestid'] = req.identifier;
        req.queryParameters['pnsdk'] = this.generatePNSDK();
        (_a = req.origin) !== null && _a !== void 0 ? _a : (req.origin = clientConfiguration.origin);
        this.authenticateRequest(req);
        this.signRequest(req);
        return req;
    }
    authenticateRequest(req) {
        var _a;
        if (req.path.startsWith('/v2/auth/') || req.path.startsWith('/v3/pam/') || req.path.startsWith('/time'))
            return;
        const { clientConfiguration, tokenManager } = this.configuration;
        const accessKey = (_a = tokenManager.getToken()) !== null && _a !== void 0 ? _a : clientConfiguration.authKey;
        if (accessKey)
            req.queryParameters['auth'] = accessKey;
    }
    signRequest(req) {
        if (!this.signatureGenerator || req.path.startsWith('/time'))
            return;
        req.queryParameters['timestamp'] = String(Math.floor(new Date().getTime() / 1000));
        req.queryParameters['signature'] = this.signatureGenerator.signature(req);
    }
    generatePNSDK() {
        const { clientConfiguration } = this.configuration;
        if (clientConfiguration.sdkName)
            return clientConfiguration.sdkName;
        let base = `PubNub-JS-${clientConfiguration.sdkFamily}`;
        if (clientConfiguration.partnerId)
            base += `-${clientConfiguration.partnerId}`;
        base += `/${clientConfiguration.getVersion()}`;
        const pnsdkSuffix = clientConfiguration._getPnsdkSuffix(' ');
        if (pnsdkSuffix.length > 0)
            base += pnsdkSuffix;
        return base;
    }
}
exports.PubNubMiddleware = PubNubMiddleware;
