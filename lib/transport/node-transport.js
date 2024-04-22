"use strict";
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const pubnub_api_error_1 = require("../errors/pubnub-api-error");
const utils_1 = require("../core/utils");
class NodeTransport {
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
                return (0, node_fetch_1.default)(request, {
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
                        throw pubnub_api_error_1.PubNubAPIError.create(transportResponse);
                    this.logRequestProcessProgress(request, new Date().getTime() - start, responseBody);
                    return transportResponse;
                })
                    .catch((error) => {
                    throw pubnub_api_error_1.PubNubAPIError.create(error);
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
                const formData = new form_data_1.default();
                for (const { key, value } of req.formData)
                    formData.append(key, value);
                formData.append('file', buffer_1.Buffer.from(fileData), { contentType: 'application/octet-stream', filename: file.name });
                body = formData;
                headers = formData.getHeaders(headers !== null && headers !== void 0 ? headers : {});
            }
            else if (req.body && (typeof req.body === 'string' || req.body instanceof ArrayBuffer))
                body = req.body;
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
    agentForTransportRequest(req) {
        if (!this.keepAlive && !this.proxyConfiguration)
            return undefined;
        if (this.proxyConfiguration)
            return this.proxyAgent ? this.proxyAgent : (this.proxyAgent = new proxy_agent_1.ProxyAgent(this.proxyConfiguration));
        const useSecureAgent = req.origin.startsWith('https:');
        if (useSecureAgent && this.httpsAgent === undefined)
            this.httpsAgent = new https_1.Agent(Object.assign({ keepAlive: true }, this.keepAliveSettings));
        else if (!useSecureAgent && this.httpAgent === undefined) {
            this.httpAgent = new http_1.Agent(Object.assign({ keepAlive: true }, this.keepAliveSettings));
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
exports.NodeTransport = NodeTransport;
NodeTransport.decoder = new TextDecoder();
