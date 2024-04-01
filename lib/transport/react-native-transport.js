/**
 * React Native Transport provider module.
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
import { queryStringFromObject } from '../core/utils';
import { PubNubAPIError } from '../errors/pubnub-api-error';
/**
 * Class representing a fetch-based React Native transport provider.
 */
export class ReactNativeTransport {
    constructor(keepAlive = false, logVerbosity) {
        this.keepAlive = keepAlive;
        this.logVerbosity = logVerbosity;
    }
    makeSendable(req) {
        let controller;
        let abortController;
        if (req.cancellable) {
            abortController = new AbortController();
            controller = {
                // Storing controller inside to prolong object lifetime.
                abortController,
                abort: () => abortController === null || abortController === void 0 ? void 0 : abortController.abort(),
            };
        }
        return [
            this.requestFromTransportRequest(req).then((request) => {
                const start = new Date().getTime();
                this.logRequestProcessProgress(request);
                /**
                 * Setup request timeout promise.
                 *
                 * **Note:** Native Fetch API doesn't support `timeout` out-of-box.
                 */
                const requestTimeout = new Promise((_, reject) => {
                    const timeoutId = setTimeout(() => {
                        // Clean up.
                        clearTimeout(timeoutId);
                        reject(new Error('Request timeout'));
                    }, req.timeout * 1000);
                });
                return Promise.race([
                    fetch(request, {
                        signal: abortController === null || abortController === void 0 ? void 0 : abortController.signal,
                        timeout: req.timeout * 1000,
                        keepalive: this.keepAlive,
                    }),
                    requestTimeout,
                ])
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
                        throw PubNubAPIError.create(transportResponse);
                    this.logRequestProcessProgress(request, new Date().getTime() - start, responseBody);
                    return transportResponse;
                })
                    .catch((error) => {
                    throw PubNubAPIError.create(error);
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
     */
    requestFromTransportRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let headers = undefined;
            let body;
            let path = req.path;
            if (req.headers) {
                headers = {};
                for (const [key, value] of Object.entries(req.headers))
                    headers[key] = value;
            }
            if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
                path = `${path}?${queryStringFromObject(req.queryParameters)}`;
            if (req.body && typeof req.body === 'object') {
                if (req.body instanceof ArrayBuffer)
                    body = req.body;
                else {
                    // Create multipart request body.
                    const fileData = yield req.body.toArrayBuffer();
                    const formData = new FormData();
                    for (const [key, value] of Object.entries((_a = req.formData) !== null && _a !== void 0 ? _a : {}))
                        formData.append(key, value);
                    formData.append('file', new Blob([fileData], { type: req.body.mimeType }), req.body.name);
                    body = formData;
                }
            }
            else
                body = req.body;
            return new Request(`${req.origin}${path}`, {
                method: req.method,
                headers,
                redirect: 'follow',
                body,
            });
        });
    }
    /**
     * Log out request processing progress and result.
     *
     * @param request - Platform-specific
     * @param [elapsed] - How many time passed since request processing started.
     * @param [body] - Service response (if available).
     */
    logRequestProcessProgress(request, elapsed, body) {
        if (!this.logVerbosity)
            return;
        const { protocol, host, pathname, search } = new URL(request.url);
        const timestamp = new Date().toISOString();
        if (!elapsed) {
            console.log('<<<<<');
            console.log(`[${timestamp}]`, `\n${protocol}//${host}${pathname}`, `\n${search}`);
            console.log('-----');
        }
        else {
            const stringifiedBody = body ? ReactNativeTransport.decoder.decode(body) : undefined;
            console.log('>>>>>>');
            console.log(`[${timestamp} / ${elapsed}]`, `\n${protocol}//${host}${pathname}`, `\n${search}`, `\n${stringifiedBody}`);
            console.log('-----');
        }
    }
}
/**
 * Service {@link ArrayBuffer} response decoder.
 */
ReactNativeTransport.decoder = new TextDecoder();
