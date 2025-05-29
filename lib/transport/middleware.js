"use strict";
/**
 * Common PubNub Network Provider middleware module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubMiddleware = void 0;
const transport_request_1 = require("../core/types/transport-request");
const categories_1 = __importDefault(require("../core/constants/categories"));
const utils_1 = require("../core/utils");
/**
 * Request signature generator.
 *
 * @internal
 */
class RequestSignature {
    constructor(publishKey, secretKey, hasher, logger) {
        this.publishKey = publishKey;
        this.secretKey = secretKey;
        this.hasher = hasher;
        this.logger = logger;
    }
    /**
     * Compute request signature.
     *
     * @param req - Request which will be used to compute signature.
     * @returns {string} `v2` request signature.
     */
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
        this.logger.trace(this.constructor.name, () => ({
            messageType: 'text',
            message: `Request signature input:\n${signatureInput}`,
        }));
        return `v2.${this.hasher(signatureInput, this.secretKey)}`
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
    /**
     * Prepare request query parameters for signature.
     *
     * @param query - Key / value pair of the request query parameters.
     * @private
     */
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
RequestSignature.textDecoder = new TextDecoder('utf-8');
/**
 * Common PubNub Network Provider middleware.
 *
 * @internal
 */
class PubNubMiddleware {
    constructor(configuration) {
        this.configuration = configuration;
        const { clientConfiguration: { keySet }, shaHMAC, } = configuration;
        if (process.env.CRYPTO_MODULE !== 'disabled') {
            if (keySet.secretKey && shaHMAC)
                this.signatureGenerator = new RequestSignature(keySet.publishKey, keySet.secretKey, shaHMAC, this.logger);
        }
    }
    /**
     * Retrieve registered loggers' manager.
     *
     * @returns Registered loggers' manager.
     */
    get logger() {
        return this.configuration.clientConfiguration.logger();
    }
    makeSendable(req) {
        const retryPolicy = this.configuration.clientConfiguration.retryConfiguration;
        const transport = this.configuration.transport;
        // Make requests retryable.
        if (retryPolicy !== undefined) {
            let retryTimeout;
            let activeCancellation;
            let canceled = false;
            let attempt = 0;
            const cancellation = {
                abort: (reason) => {
                    canceled = true;
                    if (retryTimeout)
                        clearTimeout(retryTimeout);
                    if (activeCancellation)
                        activeCancellation.abort(reason);
                },
            };
            const retryableRequest = new Promise((resolve, reject) => {
                const trySendRequest = () => {
                    // Check whether the request already has been canceled and there is no retry should proceed.
                    if (canceled)
                        return;
                    const [attemptPromise, attemptCancellation] = transport.makeSendable(this.request(req));
                    activeCancellation = attemptCancellation;
                    const responseHandler = (res, error) => {
                        const retriableError = error ? error.category !== categories_1.default.PNCancelledCategory : true;
                        const retriableStatusCode = !res || res.status >= 400;
                        let delay = -1;
                        if (retriableError &&
                            retriableStatusCode &&
                            retryPolicy.shouldRetry(req, res, error === null || error === void 0 ? void 0 : error.category, attempt + 1))
                            delay = retryPolicy.getDelay(attempt, res);
                        if (delay > 0) {
                            attempt++;
                            this.logger.warn(this.constructor.name, `HTTP request retry #${attempt} in ${delay}ms.`);
                            retryTimeout = setTimeout(() => trySendRequest(), delay);
                        }
                        else {
                            if (res)
                                resolve(res);
                            else if (error)
                                reject(error);
                        }
                    };
                    attemptPromise
                        .then((res) => responseHandler(res))
                        .catch((err) => responseHandler(undefined, err));
                };
                trySendRequest();
            });
            return [retryableRequest, activeCancellation ? cancellation : undefined];
        }
        return transport.makeSendable(this.request(req));
    }
    request(req) {
        var _a;
        const { clientConfiguration } = this.configuration;
        // Get request patched by transport provider.
        req = this.configuration.transport.request(req);
        if (!req.queryParameters)
            req.queryParameters = {};
        // Modify the request with required information.
        if (clientConfiguration.useInstanceId)
            req.queryParameters['instanceid'] = clientConfiguration.getInstanceId();
        if (!req.queryParameters['uuid'])
            req.queryParameters['uuid'] = clientConfiguration.userId;
        if (clientConfiguration.useRequestId)
            req.queryParameters['requestid'] = req.identifier;
        req.queryParameters['pnsdk'] = this.generatePNSDK();
        (_a = req.origin) !== null && _a !== void 0 ? _a : (req.origin = clientConfiguration.origin);
        // Authenticate request if required.
        this.authenticateRequest(req);
        // Sign request if it is required.
        this.signRequest(req);
        return req;
    }
    authenticateRequest(req) {
        var _a;
        // Access management endpoints don't need authentication (signature required instead).
        if (req.path.startsWith('/v2/auth/') || req.path.startsWith('/v3/pam/') || req.path.startsWith('/time'))
            return;
        const { clientConfiguration, tokenManager } = this.configuration;
        const accessKey = (_a = (tokenManager && tokenManager.getToken())) !== null && _a !== void 0 ? _a : clientConfiguration.authKey;
        if (accessKey)
            req.queryParameters['auth'] = accessKey;
    }
    /**
     * Compute and append request signature.
     *
     * @param req - Transport request with information which should be used to generate signature.
     */
    signRequest(req) {
        if (!this.signatureGenerator || req.path.startsWith('/time'))
            return;
        req.queryParameters['timestamp'] = String(Math.floor(new Date().getTime() / 1000));
        req.queryParameters['signature'] = this.signatureGenerator.signature(req);
    }
    /**
     * Compose `pnsdk` query parameter.
     *
     * SDK provides ability to set custom name or append vendor information to the `pnsdk` query
     * parameter.
     *
     * @returns Finalized `pnsdk` query parameter value.
     */
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
