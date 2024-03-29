"use strict";
/**
 * Web Worker module.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../core/utils");
// endregion
// endregion
/**
 * Map of request identifiers to their abort controllers.
 *
 * **Note:** Because of message-based nature of interaction it will be impossible to pass actual {@link AbortController}
 * to the transport provider code.
 */
var abortControllers = new Map();
/**
 * Service `ArrayBuffer` response decoder.
 */
var decoder = new TextDecoder();
/**
 * Whether verbose logging enabled or not.
 */
var logVerbosity = false;
/**
 * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
 * opening a new one for each new request.
 *
 * @default `true`
 */
var keepAlive = true;
// --------------------------------------------------------
// ------------------- Event Handlers ---------------------
// --------------------------------------------------------
// region Event Handlers
/**
 * Handle signals from the PubNub core.
 *
 * @param event - Event object from the PubNub Core with instructions for worker.
 */
self.onmessage = function (event) {
    var data = event.data;
    if (data.type === 'setup') {
        logVerbosity = data.logVerbosity;
        keepAlive = data.keepAlive;
    }
    else if (data.type === 'send-request') {
        sendRequestEventHandler(data.request);
    }
    if (data.type === 'cancel-request') {
        var controller = abortControllers.get(data.identifier);
        // Abort request if possible.
        if (controller) {
            abortControllers.delete(data.identifier);
            controller.abort();
        }
    }
    event.data;
};
/**
 * Handle request send event.
 *
 * @param req - Data for {@link Request} creation and scheduling.
 */
var sendRequestEventHandler = function (req) {
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var request, timestamp, start, requestTimeout;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, requestFromTransportRequest(req)];
                case 1:
                    request = _b.sent();
                    timestamp = new Date().toISOString();
                    start = new Date().getTime();
                    if (req.cancellable)
                        abortControllers.set(req.identifier, new AbortController());
                    requestTimeout = new Promise(function (_, reject) {
                        var timeoutId = setTimeout(function () {
                            // Clean up.
                            abortControllers.delete(req.identifier);
                            clearTimeout(timeoutId);
                            reject(new Error('Request timeout'));
                        }, req.timeout * 1000);
                    });
                    if (logVerbosity)
                        notifyRequestProcessing('start', request, timestamp, req.queryParameters);
                    Promise.race([
                        fetch(request, { signal: (_a = abortControllers.get(req.identifier)) === null || _a === void 0 ? void 0 : _a.signal, keepalive: keepAlive }),
                        requestTimeout,
                    ])
                        .then(function (response) {
                        if (parseInt(response.headers.get('Content-Length'), 10) > 0) {
                            return response.arrayBuffer().then(function (buffer) { return [response, buffer]; });
                        }
                        return [response, undefined];
                    })
                        .then(function (response) {
                        if (logVerbosity) {
                            var contentType = response[0].headers.get('Content-Type');
                            var timestampDone = new Date().toISOString();
                            var now = new Date().getTime();
                            var elapsed = now - start;
                            var body = void 0;
                            if (contentType &&
                                (contentType.includes('application/json') ||
                                    contentType.includes('text/plain') ||
                                    contentType.includes('text/html'))) {
                                body = decoder.decode(response[1]);
                            }
                            notifyRequestProcessing('end', request, timestampDone, req.queryParameters, body, elapsed);
                        }
                        // Treat 4xx and 5xx status codes as errors.
                        if (response[0].status >= 400)
                            postMessage(requestProcessingError(req.identifier, request.url, undefined, response));
                        else
                            postMessage(requestProcessingSuccess(req.identifier, request.url, response));
                    })
                        .catch(function (error) { return postMessage(requestProcessingError(error, request.url)); });
                    return [2 /*return*/];
            }
        });
    }); })();
};
// endregion
// --------------------------------------------------------
// ----------------------- Helpers ------------------------
// --------------------------------------------------------
// region Helpers
var notifyRequestProcessing = function (type, request, timestamp, query, response, duration) {
    var event;
    var _a = __read(request.url.split('?'), 1), url = _a[0];
    if (type === 'start') {
        event = {
            type: 'request-progress-start',
            url: url,
            query: query,
            timestamp: timestamp,
        };
    }
    else {
        event = {
            type: 'request-progress-end',
            url: url,
            query: query,
            response: response,
            timestamp: timestamp,
            duration: duration,
        };
    }
    postMessage(event);
};
/**
 * Create processing success event from service response.
 *
 * @param identifier - Identifier of the processed request.
 * @param url - Url which has been used to perform request.
 * @param res - Service response for used REST API endpoint along with response body.
 *
 * @returns Request processing success event object.
 */
var requestProcessingSuccess = function (identifier, url, res) {
    var _a = __read(res, 2), response = _a[0], body = _a[1];
    var contentLength = parseInt(response.headers.get('Content-Length'), 10);
    var contentType = response.headers.get('Content-Type');
    var headers = {};
    // Copy Headers object content into plain Record.
    response.headers.forEach(function (value, key) { return (headers[key] = value.toLowerCase()); });
    return {
        type: 'request-process-success',
        identifier: identifier,
        url: url,
        response: {
            contentLength: contentLength,
            contentType: contentType,
            headers: headers,
            status: response.status,
            body: body,
        },
    };
};
/**
 * Create processing error event from service response.
 *
 * @param identifier - Identifier of the failed request.
 * @param url - Url which has been used to perform request.
 * @param [error] - Client-side request processing error (for example network issues).
 * @param [res] - Service error response (for example permissions error or malformed
 * payload) along with service body.
 *
 * @returns Request processing error event object.
 */
var requestProcessingError = function (identifier, url, error, res) {
    // User service response as error information source.
    if (res) {
        return __assign(__assign({}, requestProcessingSuccess(identifier, url, res)), { type: 'request-process-error' });
    }
    var type = 'NETWORK_ISSUE';
    var message = 'Unknown error';
    var name = 'Error';
    if (error && error instanceof Error) {
        message = error.message;
        name = error.name;
    }
    if (name === 'AbortError') {
        message = 'Request aborted';
        type = 'ABORTED';
    }
    else if (message === 'Request timeout')
        type = 'TIMEOUT';
    return {
        type: 'request-process-error',
        identifier: identifier,
        url: url,
        error: { name: name, type: type, message: message },
    };
};
/**
 * Creates a Request object from a given {@link TransportRequest} object.
 *
 * @param req - The {@link TransportRequest} object containing request information.
 *
 * @returns {@link Request} object generated from the {@link TransportRequest} object.
 */
var requestFromTransportRequest = function (req) { return __awaiter(void 0, void 0, void 0, function () {
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
                formData = new FormData();
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
                formData.append('file', new Blob([fileData], { type: req.body.mimeType }), req.body.name);
                body = formData;
                _k.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                body = req.body;
                _k.label = 5;
            case 5: return [2 /*return*/, new Request("".concat(req.origin).concat(path), {
                    method: req.method,
                    headers: headers,
                    redirect: 'follow',
                    body: body,
                })];
        }
    });
}); };
// endregion
