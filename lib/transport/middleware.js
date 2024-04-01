import { TransportMethod } from '../core/types/transport-request';
import { encodeString } from '../core/utils';
export class RequestSignature {
    constructor(publishKey, secretKey, hasher) {
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
    signature(req) {
        const method = req.path.startsWith('/publish') ? TransportMethod.GET : req.method;
        let signatureInput = `${method}\n${this.publishKey}\n${req.path}\n${this.queryParameters(req.queryParameters)}\n`;
        if (method === TransportMethod.POST || method === TransportMethod.PATCH) {
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
                return `${key}=${encodeString(queryValue)}`;
            return queryValue
                .sort()
                .map((value) => `${key}=${encodeString(value)}`)
                .join('&');
        })
            .join('&');
    }
}
RequestSignature.textDecoder = new TextDecoder('utf-8');
export class PubNubMiddleware {
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
    }
    authenticateRequest(req) {
        var _a;
        // Access management endpoints doesn't need authentication (signature required instead).
        if (req.path.startsWith('/v2/auth/') || req.path.startsWith('/v3/pam/') || req.path.startsWith('/time'))
            return;
        const { clientConfiguration, tokenManager } = this.configuration;
        const accessKey = (_a = tokenManager.getToken()) !== null && _a !== void 0 ? _a : clientConfiguration.authKey;
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
        base += `/${clientConfiguration.version}`;
        const pnsdkSuffix = clientConfiguration._getPnsdkSuffix(' ');
        if (pnsdkSuffix.length > 0)
            base += pnsdkSuffix;
        return base;
    }
}
