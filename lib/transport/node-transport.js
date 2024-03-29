"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeTransport = void 0;
var node_fetch_1 = __importStar(require("node-fetch"));
var proxy_agent_1 = require("proxy-agent");
var https_1 = require("https");
var http_1 = require("http");
var form_data_1 = __importDefault(require("form-data"));
var buffer_1 = require("buffer");
var utils_1 = require("../core/utils");
var api_1 = require("../core/types/api");
/**
 * Class representing a fetch-based Node.js transport provider.
 */
var NodeTransport = /** @class */ (function () {
    /**
     * Creates a new `fetch`-based transport instance.
     *
     * @param keepAlive - Indicates whether keep-alive should be enabled.
     * @param [keepAliveSettings] - Optional settings for keep-alive.
     * @param [logVerbosity] - Whether verbose logging enabled or not.
     *
     * @returns Transport for performing network requests.
     */
    function NodeTransport(keepAlive, keepAliveSettings, logVerbosity) {
        if (keepAlive === void 0) { keepAlive = false; }
        if (keepAliveSettings === void 0) { keepAliveSettings = { timeout: 30000 }; }
        if (logVerbosity === void 0) { logVerbosity = false; }
        this.keepAlive = keepAlive;
        this.keepAliveSettings = keepAliveSettings;
        this.logVerbosity = logVerbosity;
    }
    /**
     * Update request proxy configuration.
     *
     * @param configuration - New proxy configuration.
     */
    NodeTransport.prototype.setProxy = function (configuration) {
        this.proxyConfiguration = configuration;
    };
    NodeTransport.prototype.makeSendable = function (req) {
        var _this = this;
        var controller = undefined;
        var abortController;
        if (req.cancellable) {
            abortController = new AbortController();
            controller = {
                // Storing controller inside to prolong object lifetime.
                abortController: abortController,
                abort: function () { return abortController === null || abortController === void 0 ? void 0 : abortController.abort(); },
            };
        }
        return [
            this.requestFromTransportRequest(req).then(function (request) {
                var start = new Date().getTime();
                _this.logRequestProcessProgress(request);
                return (0, node_fetch_1.default)(request, {
                    signal: abortController === null || abortController === void 0 ? void 0 : abortController.signal,
                    timeout: req.timeout * 1000,
                })
                    .then(function (response) {
                    if (parseInt(response.headers.get('Content-Length'), 10) > 0) {
                        return response.arrayBuffer().then(function (arrayBuffer) { return [response, arrayBuffer]; });
                    }
                    return [response, undefined];
                })
                    .then(function (response) {
                    var _a = response[0], status = _a.status, requestHeaders = _a.headers;
                    var headers = {};
                    // Copy Headers object content into plain Record.
                    requestHeaders.forEach(function (value, key) { return (headers[key] = value.toLowerCase()); });
                    var transportResponse = {
                        status: status,
                        url: request.url,
                        headers: headers,
                        body: response[1],
                    };
                    if (status >= 400)
                        throw api_1.PubNubAPIError.create(transportResponse);
                    _this.logRequestProcessProgress(request, new Date().getTime() - start, response[1]);
                    return transportResponse;
                })
                    .catch(function (error) {
                    throw api_1.PubNubAPIError.create(error);
                });
            }),
            controller,
        ];
    };
    NodeTransport.prototype.request = function (req) {
        return req;
    };
    /**
     * Creates a Request object from a given {@link TransportRequest} object.
     *
     * @param req - The {@link TransportRequest} object containing request information.
     *
     * @returns Request object generated from the {@link TransportRequest} object.
     */
    NodeTransport.prototype.requestFromTransportRequest = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, body, path, _a, _b, _c, key, value, fileData, formData, _d, _e, _f, key, value;
            var e_1, _g, e_2, _h;
            var _j;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        headers = undefined;
                        path = req.path;
                        if (req.headers) {
                            headers = {};
                            try {
                                for (_a = __values(Object.entries(req.headers)), _b = _a.next(); !_b.done; _b = _a.next()) {
                                    _c = __read(_b.value, 2), key = _c[0], value = _c[1];
                                    headers[key] = value;
                                }
                            }
                            catch (e_1_1) { e_1 = { error: e_1_1 }; }
                            finally {
                                try {
                                    if (_b && !_b.done && (_g = _a.return)) _g.call(_a);
                                }
                                finally { if (e_1) throw e_1.error; }
                            }
                        }
                        if (req.queryParameters && Object.keys(req.queryParameters).length !== 0)
                            path = "".concat(path, "?").concat((0, utils_1.queryStringFromObject)(req.queryParameters));
                        if (!(req.body && typeof req.body === 'object')) return [3 /*break*/, 4];
                        if (!(req.body instanceof ArrayBuffer)) return [3 /*break*/, 1];
                        body = req.body;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, req.body.toArrayBuffer()];
                    case 2:
                        fileData = _k.sent();
                        formData = new form_data_1.default();
                        try {
                            for (_d = __values(Object.entries((_j = req.formData) !== null && _j !== void 0 ? _j : {})), _e = _d.next(); !_e.done; _e = _d.next()) {
                                _f = __read(_e.value, 2), key = _f[0], value = _f[1];
                                formData.append(key, value);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_e && !_e.done && (_h = _d.return)) _h.call(_d);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        formData.append('file', buffer_1.Buffer.from(fileData), { contentType: req.body.mimeType, filename: req.body.name });
                        body = formData;
                        headers = formData.getHeaders(headers);
                        _k.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        body = req.body;
                        _k.label = 5;
                    case 5: return [2 /*return*/, new node_fetch_1.Request("".concat(req.origin).concat(path), {
                            agent: this.agentForTransportRequest(req),
                            method: req.method,
                            headers: headers,
                            redirect: 'follow',
                            body: body,
                        })];
                }
            });
        });
    };
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
    NodeTransport.prototype.agentForTransportRequest = function (req) {
        // Don't configure any agents if keep alive not requested.
        if (!this.keepAlive && !this.proxyConfiguration)
            return undefined;
        // Create proxy agent (if possible).
        if (this.proxyConfiguration)
            return this.proxyAgent ? this.proxyAgent : (this.proxyAgent = new proxy_agent_1.ProxyAgent(this.proxyConfiguration));
        // Create keep alive agent.
        var useSecureAgent = req.origin.startsWith('https:');
        if (useSecureAgent && this.httpsAgent === undefined)
            this.httpsAgent = new https_1.Agent(__assign({ keepAlive: true }, this.keepAliveSettings));
        else if (!useSecureAgent && this.httpAgent === undefined) {
            this.httpAgent = new http_1.Agent(__assign({ keepAlive: true }, this.keepAliveSettings));
        }
        return useSecureAgent ? this.httpsAgent : this.httpAgent;
    };
    /**
     * Log out request processing progress and result.
     *
     * @param request - Platform-specific
     * @param [elapsed] - How many time passed since request processing started.
     * @param [body] - Service response (if available).
     */
    NodeTransport.prototype.logRequestProcessProgress = function (request, elapsed, body) {
        if (!this.logVerbosity)
            return;
        var _a = new URL(request.url), protocol = _a.protocol, host = _a.host, pathname = _a.pathname, search = _a.search;
        var timestamp = new Date().toISOString();
        if (!elapsed) {
            console.log('<<<<<');
            console.log("[".concat(timestamp, "]"), "\n".concat(protocol, "//").concat(host).concat(pathname), "\n".concat(search));
            console.log('-----');
        }
        else {
            var stringifiedBody = body ? NodeTransport.decoder.decode(body) : undefined;
            console.log('>>>>>>');
            console.log("[".concat(timestamp, " / ").concat(elapsed, "]"), "\n".concat(protocol, "//").concat(host).concat(pathname), "\n".concat(search), "\n".concat(stringifiedBody));
            console.log('-----');
        }
    };
    /**
     * Service {@link ArrayBuffer} response decoder.
     */
    NodeTransport.decoder = new TextDecoder();
    return NodeTransport;
}());
exports.NodeTransport = NodeTransport;
