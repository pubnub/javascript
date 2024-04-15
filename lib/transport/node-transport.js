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
import { PubNubAPIError } from '../errors/pubnub-api-error';
import { queryStringFromObject } from '../core/utils';
export class NodeTransport {
    constructor(keepAlive = false, keepAliveSettings = { timeout: 30000 }, logVerbosity = false) {
        this.keepAlive = keepAlive;
        this.keepAliveSettings = keepAliveSettings;
        this.logVerbosity = logVerbosity;
    }
    setProxy(configuration) {
        this.proxyConfiguration = configuration;
    }
    makeSendable(req) {
        let controller = undefined;
        let abortController;
        if (req.cancellable) {
            abortController = new AbortController();
            controller = {
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
    requestFromTransportRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let headers = req.headers;
            let body;
            let path = req.path;
            if (req.formData && req.formData.length > 0) {
                req.queryParameters = {};
                const file = req.body;
                const fileData = yield file.toArrayBuffer();
                const formData = new FormData();
                for (const { key, value } of req.formData)
                    formData.append(key, value);
                formData.append('file', Buffer.from(fileData), { contentType: 'application/octet-stream', filename: file.name });
                body = formData;
                headers = formData.getHeaders(headers !== null && headers !== void 0 ? headers : {});
            }
            else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer))
                body = req.body;
            if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
                path = `${path}?${queryStringFromObject(req.queryParameters)}`;
            return new Request(`${req.origin}${path}`, {
                agent: this.agentForTransportRequest(req),
                method: req.method,
                headers,
                redirect: 'follow',
                body,
            });
        });
    }
    agentForTransportRequest(req) {
        if (!this.keepAlive && !this.proxyConfiguration)
            return undefined;
        if (this.proxyConfiguration)
            return this.proxyAgent ? this.proxyAgent : (this.proxyAgent = new ProxyAgent(this.proxyConfiguration));
        const useSecureAgent = req.origin.startsWith('https:');
        if (useSecureAgent && this.httpsAgent === undefined)
            this.httpsAgent = new HttpsAgent(Object.assign({ keepAlive: true }, this.keepAliveSettings));
        else if (!useSecureAgent && this.httpAgent === undefined) {
            this.httpAgent = new HttpAgent(Object.assign({ keepAlive: true }, this.keepAliveSettings));
        }
        return useSecureAgent ? this.httpsAgent : this.httpAgent;
    }
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
NodeTransport.decoder = new TextDecoder();
