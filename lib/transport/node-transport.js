"use strict";
/**
 * Node.js Transport provider module.
 *
 * @internal
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTransport = void 0;
const node_fetch_1 = __importStar(require("node-fetch"));
const proxy_agent_1 = require("proxy-agent");
const https_1 = require("https");
const http_1 = require("http");
const form_data_1 = __importDefault(require("form-data"));
const buffer_1 = require("buffer");
const zlib = __importStar(require("zlib"));
const pubnub_api_error_1 = require("../errors/pubnub-api-error");
const utils_1 = require("../core/utils");
/**
 * Class representing a fetch-based Node.js transport provider.
 *
 * @internal
 */
class NodeTransport {
    /**
     * Creates a new `fetch`-based transport instance.
     *
     * @param logger - Registered loggers' manager.
     * @param keepAlive - Indicates whether keep-alive should be enabled.
     * @param [keepAliveSettings] - Optional settings for keep-alive.
     *
     * @returns Transport for performing network requests.
     *
     * @internal
     */
    constructor(logger, keepAlive = false, keepAliveSettings = { timeout: 30000 }) {
        this.logger = logger;
        this.keepAlive = keepAlive;
        this.keepAliveSettings = keepAliveSettings;
        logger.debug(this.constructor.name, () => ({
            messageType: 'object',
            message: { keepAlive, keepAliveSettings },
            details: 'Create with configuration:',
        }));
    }
    /**
     * Update request proxy configuration.
     *
     * @param configuration - New proxy configuration.
     *
     * @internal
     */
    setProxy(configuration) {
        if (configuration)
            this.logger.debug(this.constructor.name, 'Proxy configuration has been set.');
        else
            this.logger.debug(this.constructor.name, 'Proxy configuration has been removed.');
        this.proxyConfiguration = configuration;
    }
    makeSendable(req) {
        let controller = undefined;
        let abortController;
        if (req.cancellable) {
            abortController = new AbortController();
            controller = {
                // Storing a controller inside to prolong object lifetime.
                abortController,
                abort: (reason) => {
                    if (!abortController || abortController.signal.aborted)
                        return;
                    this.logger.trace(this.constructor.name, `On-demand request aborting: ${reason}`);
                    abortController === null || abortController === void 0 ? void 0 : abortController.abort(reason);
                },
            };
        }
        return [
            this.requestFromTransportRequest(req).then((request) => {
                this.logger.debug(this.constructor.name, () => ({ messageType: 'network-request', message: req }));
                return (0, node_fetch_1.default)(request, {
                    signal: abortController === null || abortController === void 0 ? void 0 : abortController.signal,
                    timeout: req.timeout * 1000,
                })
                    .then((response) => response.arrayBuffer().then((arrayBuffer) => [response, arrayBuffer]))
                    .then((response) => {
                    const responseBody = response[1].byteLength > 0 ? response[1] : undefined;
                    const { status, headers: requestHeaders } = response[0];
                    const headers = {};
                    // Copy Headers object content into plain Record.
                    requestHeaders.forEach((value, key) => (headers[key] = value.toLowerCase()));
                    const transportResponse = {
                        status,
                        url: request.url,
                        headers,
                        body: responseBody,
                    };
                    this.logger.debug(this.constructor.name, () => ({
                        messageType: 'network-response',
                        message: transportResponse,
                    }));
                    if (status >= 400)
                        throw pubnub_api_error_1.PubNubAPIError.create(transportResponse);
                    return transportResponse;
                })
                    .catch((error) => {
                    const errorMessage = (typeof error === 'string' ? error : error.message).toLowerCase();
                    let fetchError = typeof error === 'string' ? new Error(error) : error;
                    if (errorMessage.includes('timeout')) {
                        this.logger.warn(this.constructor.name, () => ({
                            messageType: 'network-request',
                            message: req,
                            details: 'Timeout',
                            canceled: true,
                        }));
                    }
                    else if (errorMessage.includes('cancel') || errorMessage.includes('abort')) {
                        this.logger.debug(this.constructor.name, () => ({
                            messageType: 'network-request',
                            message: req,
                            details: 'Aborted',
                            canceled: true,
                        }));
                        fetchError = new node_fetch_1.AbortError('Aborted');
                    }
                    else if (errorMessage.includes('network')) {
                        this.logger.warn(this.constructor.name, () => ({
                            messageType: 'network-request',
                            message: req,
                            details: 'Network error',
                            failed: true,
                        }));
                    }
                    else {
                        this.logger.warn(this.constructor.name, () => ({
                            messageType: 'network-request',
                            message: req,
                            details: pubnub_api_error_1.PubNubAPIError.create(fetchError).message,
                            failed: true,
                        }));
                    }
                    throw pubnub_api_error_1.PubNubAPIError.create(fetchError);
                });
            }),
            controller,
        ];
    }
    request(req) {
        return req;
    }
    /**
     * Creates a Request object from a given {@link TransportRequest} object.
     *
     * @param req - The {@link TransportRequest} object containing request information.
     *
     * @returns Request object generated from the {@link TransportRequest} object.
     *
     * @internal
     */
    requestFromTransportRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let headers = req.headers;
            let body;
            let path = req.path;
            // Create multipart request body.
            if (req.formData && req.formData.length > 0) {
                // Reset query parameters to conform to signed URL
                req.queryParameters = {};
                const file = req.body;
                const fileData = yield file.toArrayBuffer();
                const formData = new form_data_1.default();
                for (const { key, value } of req.formData)
                    formData.append(key, value);
                formData.append('file', buffer_1.Buffer.from(fileData), { contentType: 'application/octet-stream', filename: file.name });
                body = formData;
                headers = formData.getHeaders(headers !== null && headers !== void 0 ? headers : {});
            }
            // Handle regular body payload (if passed).
            else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer)) {
                let initialBodySize = 0;
                if (req.compressible) {
                    initialBodySize =
                        typeof req.body === 'string' ? NodeTransport.encoder.encode(req.body).byteLength : req.body.byteLength;
                }
                // Compressing body (if required).
                body = req.compressible ? zlib.deflateSync(req.body) : req.body;
                if (req.compressible) {
                    this.logger.trace(this.constructor.name, () => {
                        const compressedSize = body.byteLength;
                        const ratio = (compressedSize / initialBodySize).toFixed(2);
                        return {
                            messageType: 'text',
                            message: `Body of ${initialBodySize} bytes, compressed by ${ratio}x to ${compressedSize} bytes.`,
                        };
                    });
                }
            }
            if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
                path = `${path}?${(0, utils_1.queryStringFromObject)(req.queryParameters)}`;
            return new node_fetch_1.Request(`${req.origin}${path}`, {
                agent: this.agentForTransportRequest(req),
                method: req.method,
                headers,
                redirect: 'follow',
                body,
            });
        });
    }
    /**
     * Determines and returns the appropriate agent for a given transport request.
     *
     * If keep alive is not requested, returns undefined.
     *
     * @param req - The transport request object.
     *
     * @returns {HttpAgent | HttpsAgent | undefined} - The appropriate agent for the request, or
     * undefined if keep alive or proxy not requested.
     *
     * @internal
     */
    agentForTransportRequest(req) {
        // Create a proxy agent (if possible).
        if (this.proxyConfiguration)
            return this.proxyAgent ? this.proxyAgent : (this.proxyAgent = new proxy_agent_1.ProxyAgent(this.proxyConfiguration));
        // Create keep alive agent.
        const useSecureAgent = req.origin.startsWith('https:');
        const agentOptions = Object.assign({ keepAlive: this.keepAlive }, (this.keepAlive ? this.keepAliveSettings : {}));
        if (useSecureAgent && this.httpsAgent === undefined)
            this.httpsAgent = new https_1.Agent(agentOptions);
        else if (!useSecureAgent && this.httpAgent === undefined)
            this.httpAgent = new http_1.Agent(agentOptions);
        return useSecureAgent ? this.httpsAgent : this.httpAgent;
    }
}
exports.NodeTransport = NodeTransport;
/**
 * Service {@link ArrayBuffer} response decoder.
 *
 * @internal
 */
NodeTransport.decoder = new TextDecoder();
/**
 * {@link string|String} to {@link ArrayBuffer} response decoder.
 */
NodeTransport.encoder = new TextEncoder();
