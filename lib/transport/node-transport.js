var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch, { Request } from 'node-fetch';
import { ProxyAgent } from 'proxy-agent';
import { Agent as HttpsAgent } from 'https';
import { Agent as HttpAgent } from 'http';
import FormData from 'form-data';
import { Buffer } from 'buffer';
import { queryStringFromObject } from '../core/utils';
import { PubNubAPIError } from '../errors/pubnub-api-error';
/**
 * Class representing a fetch-based Node.js transport provider.
 */
export class NodeTransport {
    /**
     * Creates a new `fetch`-based transport instance.
     *
     * @param keepAlive - Indicates whether keep-alive should be enabled.
     * @param [keepAliveSettings] - Optional settings for keep-alive.
     * @param [logVerbosity] - Whether verbose logging enabled or not.
     *
     * @returns Transport for performing network requests.
     */
    constructor(keepAlive = false, keepAliveSettings = { timeout: 30000 }, logVerbosity = false) {
        this.keepAlive = keepAlive;
        this.keepAliveSettings = keepAliveSettings;
        this.logVerbosity = logVerbosity;
    }
    /**
     * Update request proxy configuration.
     *
     * @param configuration - New proxy configuration.
     */
    setProxy(configuration) {
        this.proxyConfiguration = configuration;
    }
    makeSendable(req) {
        let controller = undefined;
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
                return fetch(request, {
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
                    formData.append('file', Buffer.from(fileData), { contentType: req.body.mimeType, filename: req.body.name });
                    body = formData;
                    headers = formData.getHeaders(headers);
                }
            }
            else
                body = req.body;
            return new Request(`${req.origin}${path}`, {
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
     */
    agentForTransportRequest(req) {
        // Don't configure any agents if keep alive not requested.
        if (!this.keepAlive && !this.proxyConfiguration)
            return undefined;
        // Create proxy agent (if possible).
        if (this.proxyConfiguration)
            return this.proxyAgent ? this.proxyAgent : (this.proxyAgent = new ProxyAgent(this.proxyConfiguration));
        // Create keep alive agent.
        const useSecureAgent = req.origin.startsWith('https:');
        if (useSecureAgent && this.httpsAgent === undefined)
            this.httpsAgent = new HttpsAgent(Object.assign({ keepAlive: true }, this.keepAliveSettings));
        else if (!useSecureAgent && this.httpAgent === undefined) {
            this.httpAgent = new HttpAgent(Object.assign({ keepAlive: true }, this.keepAliveSettings));
        }
        return useSecureAgent ? this.httpsAgent : this.httpAgent;
    }
    /**
     * Log out request processing progress and result.
     *
     * @param request - Platform-specific request object.
     * @param [elapsed] - How many times passed since request processing started.
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
            const stringifiedBody = body ? NodeTransport.decoder.decode(body) : undefined;
            console.log('>>>>>>');
            console.log(`[${timestamp} / ${elapsed}]`, `\n${protocol}//${host}${pathname}`, `\n${search}`, `\n${stringifiedBody}`);
            console.log('-----');
        }
    }
}
/**
 * Service {@link ArrayBuffer} response decoder.
 */
NodeTransport.decoder = new TextDecoder();
