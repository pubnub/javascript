"use strict";
/* global window */
/**
 * Web Transport provider module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebTransport = void 0;
var api_1 = require("../core/types/api");
var categories_1 = __importDefault(require("../core/constants/categories"));
var worker = require('./web-worker.ts');
/**
 * Class representing a fetch-based Web Worker transport provider.
 */
var WebTransport = /** @class */ (function () {
    function WebTransport(keepAlive, logVerbosity) {
        if (keepAlive === void 0) { keepAlive = false; }
        this.keepAlive = keepAlive;
        this.logVerbosity = logVerbosity;
        this.setupWorker();
    }
    WebTransport.prototype.makeSendable = function (req) {
        var _this = this;
        var controller;
        var sendRequestEvent = {
            type: 'send-request',
            request: req,
        };
        if (req.cancellable) {
            controller = {
                abort: function () {
                    var cancelRequest = {
                        type: 'cancel-request',
                        identifier: req.identifier,
                    };
                    // Cancel active request with specified identifier.
                    _this.worker.postMessage(cancelRequest);
                },
            };
        }
        return [
            new Promise(function (resolve, reject) {
                // Associate Promise resolution / reject with request identifier for future usage in
                // `onmessage` handler block to return results.
                _this.callbacks.set(req.identifier, { resolve: resolve, reject: reject });
                // Trigger request processing by Web Worker.
                _this.worker.postMessage(sendRequestEvent);
            }),
            controller,
        ];
    };
    WebTransport.prototype.request = function (req) {
        return req;
    };
    /**
     * Complete PubNub Web Worker setup.
     */
    WebTransport.prototype.setupWorker = function () {
        var _this = this;
        this.worker = new Worker(URL.createObjectURL(new Blob([worker], { type: 'application/javascript' })), {
            name: '/pubnub',
        });
        this.callbacks = new Map();
        // Complete Web Worker initialization.
        var setupEvent = {
            type: 'setup',
            logVerbosity: this.logVerbosity,
            keepAlive: this.keepAlive,
        };
        this.worker.postMessage(setupEvent);
        this.worker.onmessage = function (event) {
            var data = event.data;
            if (data.type === 'request-progress-start' || data.type === 'request-progress-end') {
                _this.logRequestProgress(data);
            }
            else if (data.type === 'request-process-success' || data.type === 'request-process-error') {
                var _a = _this.callbacks.get(data.identifier), resolve = _a.resolve, reject = _a.reject;
                if (data.type === 'request-process-success') {
                    resolve({
                        status: data.response.status,
                        url: data.url,
                        headers: data.response.headers,
                        body: data.response.body,
                    });
                }
                else {
                    var category = categories_1.default.PNUnknownCategory;
                    var message = 'Unknown error';
                    // Handle client-side issues (if any).
                    if (data.error) {
                        if (data.error.type === 'NETWORK_ISSUE')
                            category = categories_1.default.PNNetworkIssuesCategory;
                        else if (data.error.type === 'TIMEOUT')
                            category = categories_1.default.PNTimeoutCategory;
                        message = data.error.message;
                    }
                    // Handle service error response.
                    else if (data.response) {
                        return reject(api_1.PubNubAPIError.create({
                            url: data.url,
                            headers: data.response.headers,
                            body: data.response.body,
                            status: data.response.status,
                        }));
                    }
                    reject(new api_1.PubNubAPIError(message, category, 0));
                }
            }
        };
    };
    /**
     * Print request progress information.
     *
     * @param information - Request progress information from Web Worker.
     */
    WebTransport.prototype.logRequestProgress = function (information) {
        var _a, _b;
        if (information.type === 'request-progress-start') {
            console.log('<<<<<');
            console.log("[".concat(information.timestamp, "]"), '\n', information.url, '\n', JSON.stringify((_a = information.query) !== null && _a !== void 0 ? _a : {}));
            console.log('-----');
        }
        else {
            console.log('>>>>>>');
            console.log("[".concat(information.timestamp, " / ").concat(information.duration, "]"), '\n', information.url, '\n', JSON.stringify((_b = information.query) !== null && _b !== void 0 ? _b : {}), '\n', information.response);
            console.log('-----');
        }
    };
    return WebTransport;
}());
exports.WebTransport = WebTransport;
