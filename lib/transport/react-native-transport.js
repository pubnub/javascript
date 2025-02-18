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
     * @param [keepAlive] - Whether client should try to keep connections open for reuse or not.
     * @param logVerbosity - Whether verbose logs should be printed or not.
     *
     * @internal
     */
    constructor(keepAlive = false, logVerbosity = false) {
        this.keepAlive = keepAlive;
        this.logVerbosity = logVerbosity;
    }
    makeSendable(req) {
        const abortController = new AbortController();
        const controller = {
            // Storing controller inside to prolong object lifetime.
            abortController,
            abort: (reason) => !abortController.signal.aborted && abortController.abort(reason),
        };
        return [
            this.requestFromTransportRequest(req).then((request) => {
                const start = new Date().getTime();
                this.logRequestProcessProgress(request, req.body);
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
                    if (status >= 400)
                        throw pubnub_api_error_1.PubNubAPIError.create(transportResponse);
                    this.logRequestProcessProgress(request, undefined, new Date().getTime() - start, responseBody);
                    return transportResponse;
                })
                    .catch((error) => {
                    let fetchError = error;
                    if (typeof error === 'string') {
                        const errorMessage = error.toLowerCase();
                        if (errorMessage.includes('timeout') || !errorMessage.includes('cancel'))
                            fetchError = new Error(error);
                        else if (errorMessage.includes('cancel'))
                            fetchError = new DOMException('Aborted', 'AbortError');
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
            // Create multipart request body.
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
            else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer))
                body = req.body;
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
    /**
     * Log out request processing progress and result.
     *
     * @param request - Platform-specific
     * @param [requestBody] - POST / PATCH body.
     * @param [elapsed] - How many seconds passed since request processing started.
     * @param [body] - Service response (if available).
     *
     * @internal
     */
    logRequestProcessProgress(request, requestBody, elapsed, body) {
        if (!this.logVerbosity)
            return;
        const { protocol, host, pathname, search } = new URL(request.url);
        const timestamp = new Date().toISOString();
        if (!elapsed) {
            let outgoing = `[${timestamp}]\n${protocol}//${host}${pathname}\n${search}`;
            if (requestBody && (typeof requestBody === 'string' || requestBody instanceof ArrayBuffer)) {
                if (typeof requestBody === 'string')
                    outgoing += `\n\n${requestBody}`;
                else
                    outgoing += `\n\n${ReactNativeTransport.decoder.decode(requestBody)}`;
            }
            console.log(`<<<<<`);
            console.log(outgoing);
            console.log('-----');
        }
        else {
            let outgoing = `[${timestamp} / ${elapsed}]\n${protocol}//${host}${pathname}\n${search}`;
            if (body)
                outgoing += `\n\n${ReactNativeTransport.decoder.decode(body)}`;
            console.log('>>>>>>');
            console.log(outgoing);
            console.log('-----');
        }
    }
}
exports.ReactNativeTransport = ReactNativeTransport;
/**
 * Service {@link ArrayBuffer} response decoder.
 *
 * @internal
 */
ReactNativeTransport.decoder = new TextDecoder();
