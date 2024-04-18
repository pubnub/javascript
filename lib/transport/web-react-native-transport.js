var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PubNubAPIError } from '../errors/pubnub-api-error';
import { queryStringFromObject } from '../core/utils';
export class WebReactNativeTransport {
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
                abortController,
                abort: () => abortController === null || abortController === void 0 ? void 0 : abortController.abort(),
            };
        }
        return [
            this.requestFromTransportRequest(req).then((request) => {
                const start = new Date().getTime();
                this.logRequestProcessProgress(request);
                const requestTimeout = new Promise((_, reject) => {
                    const timeoutId = setTimeout(() => {
                        clearTimeout(timeoutId);
                        reject(new Error('Request timeout'));
                    }, req.timeout * 1000);
                });
                return Promise.race([fetch(request, { signal: abortController === null || abortController === void 0 ? void 0 : abortController.signal }), requestTimeout])
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
            let body;
            let path = req.path;
            if (req.formData && req.formData.length > 0) {
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
                        formData.append('file', fileData, file.name);
                    }
                    catch (_) { }
                }
                body = formData;
            }
            else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer))
                body = req.body;
            if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
                path = `${path}?${queryStringFromObject(req.queryParameters)}`;
            return new Request(`${req.origin}${path}`, {
                method: req.method,
                headers: req.headers,
                redirect: 'follow',
                body,
            });
        });
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
            const stringifiedBody = body ? WebReactNativeTransport.decoder.decode(body) : undefined;
            console.log('>>>>>>');
            console.log(`[${timestamp} / ${elapsed}]`, `\n${protocol}//${host}${pathname}`, `\n${search}`, `\n${stringifiedBody}`);
            console.log('-----');
        }
    }
}
WebReactNativeTransport.decoder = new TextDecoder();
