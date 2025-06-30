"use strict";
/**
 * Common browser and React Native Transport provider module.
 *
 * @internal
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactNativeTransport = void 0;
const fflate_1 = require("fflate");
const pubnub_api_error_1 = require("../errors/pubnub-api-error");
const utils_1 = require("../core/utils");
/**
 * Class representing a React Native transport provider.
 *
 * @internal
 */
class ReactNativeTransport {
    /**
     * Create and configure transport provider for Web and Rect environments.
     *
     * @param logger - Registered loggers' manager.
     * @param [keepAlive] - Whether client should try to keep connections open for reuse or not.
     *
     * @internal
     */
    constructor(logger, keepAlive = false) {
        this.logger = logger;
        this.keepAlive = keepAlive;
        logger.debug('ReactNativeTransport', `Create with configuration:\n  - keep-alive: ${keepAlive}`);
    }
    makeSendable(req) {
        const abortController = new AbortController();
        const controller = {
            // Storing a controller inside to prolong object lifetime.
            abortController,
            abort: (reason) => {
                if (!abortController.signal.aborted) {
                    this.logger.trace('ReactNativeTransport', `On-demand request aborting: ${reason}`);
                    abortController.abort(reason);
                }
            },
        };
        return [
            this.requestFromTransportRequest(req).then((request) => {
                this.logger.debug('ReactNativeTransport', () => ({ messageType: 'network-request', message: req }));
                /**
                 * Setup request timeout promise.
                 *
                 * **Note:** Native Fetch API doesn't support `timeout` out-of-box.
                 */
                let timeoutId;
                const requestTimeout = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        clearTimeout(timeoutId);
                        reject(new Error('Request timeout'));
                        controller.abort('Cancel because of timeout');
                    }, req.timeout * 1000);
                });
                return Promise.race([
                    fetch(request, {
                        signal: abortController.signal,
                        credentials: 'omit',
                        cache: 'no-cache',
                    }),
                    requestTimeout,
                ])
                    .then((response) => {
                    if (timeoutId)
                        clearTimeout(timeoutId);
                    return response;
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
                    this.logger.debug('ReactNativeTransport', () => ({
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
                        this.logger.warn('ReactNativeTransport', () => ({
                            messageType: 'network-request',
                            message: req,
                            details: 'Timeout',
                            canceled: true,
                        }));
                    }
                    else if (errorMessage.includes('cancel') || errorMessage.includes('abort')) {
                        this.logger.debug('ReactNativeTransport', () => ({
                            messageType: 'network-request',
                            message: req,
                            details: 'Aborted',
                            canceled: true,
                        }));
                        fetchError = new Error('Aborted');
                        fetchError.name = 'AbortError';
                    }
                    else if (errorMessage.includes('network')) {
                        this.logger.warn('ReactNativeTransport', () => ({
                            messageType: 'network-request',
                            message: req,
                            details: 'Network error',
                            failed: true,
                        }));
                    }
                    else {
                        this.logger.warn('ReactNativeTransport', () => ({
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
            let body;
            let path = req.path;
            // Create a multipart request body.
            if (req.formData && req.formData.length > 0) {
                // Reset query parameters to conform to signed URL
                req.queryParameters = {};
                const file = req.body;
                const formData = new FormData();
                for (const { key, value } of req.formData)
                    formData.append(key, value);
                try {
                    const fileData = yield file.toArrayBuffer();
                    formData.append('file', new Blob([fileData], { type: 'application/octet-stream' }), file.name);
                }
                catch (_) {
                    try {
                        const fileData = yield file.toFileUri();
                        // @ts-expect-error React Native File Uri support.
                        formData.append('file', fileData, file.name);
                    }
                    catch (_) { }
                }
                body = formData;
            }
            // Handle regular body payload (if passed).
            else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer)) {
                if (req.compressible) {
                    const bodyArrayBuffer = typeof req.body === 'string' ? ReactNativeTransport.encoder.encode(req.body) : new Uint8Array(req.body);
                    const initialBodySize = bodyArrayBuffer.byteLength;
                    body = (0, fflate_1.gzipSync)(bodyArrayBuffer);
                    this.logger.trace('ReactNativeTransport', () => {
                        const compressedSize = body.byteLength;
                        const ratio = (compressedSize / initialBodySize).toFixed(2);
                        return {
                            messageType: 'text',
                            message: `Body of ${initialBodySize} bytes, compressed by ${ratio}x to ${compressedSize} bytes.`,
                        };
                    });
                }
                else
                    body = req.body;
            }
            if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
                path = `${path}?${(0, utils_1.queryStringFromObject)(req.queryParameters)}`;
            return new Request(`${req.origin}${path}`, {
                method: req.method,
                headers: req.headers,
                redirect: 'follow',
                body,
            });
        });
    }
}
exports.ReactNativeTransport = ReactNativeTransport;
/**
 * Request body decoder.
 *
 * @internal
 */
ReactNativeTransport.encoder = new TextEncoder();
/**
 * Service {@link ArrayBuffer} response decoder.
 *
 * @internal
 */
ReactNativeTransport.decoder = new TextDecoder();
