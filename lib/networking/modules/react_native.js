"use strict";
/*       */
/* global FormData */
/* global fetch */
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
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getfile = exports.postfile = void 0;
var web_node_1 = require("./web-node");
function postfileuri(url, fields, fileInput) {
    return __awaiter(this, void 0, void 0, function () {
        var formData, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formData = new FormData();
                    fields.forEach(function (_a) {
                        var key = _a.key, value = _a.value;
                        formData.append(key, value);
                    });
                    formData.append('file', fileInput);
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            body: formData,
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function postfile(url, fields, fileInput) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!fileInput.uri) {
                return [2 /*return*/, (0, web_node_1.postfile)(url, fields, fileInput)];
            }
            return [2 /*return*/, postfileuri(url, fields, fileInput)];
        });
    });
}
exports.postfile = postfile;
function getfile(params, endpoint, callback) {
    var _this = this;
    var url = this.getStandardOrigin() + endpoint.url;
    if (params && Object.keys(params).length > 0) {
        var searchParams = new URLSearchParams(params);
        if (endpoint.url.indexOf('?') > -1) {
            url += '&';
        }
        else {
            url += '?';
        }
        url += searchParams.toString();
    }
    var fetchResult = fetch(url, { method: 'GET', headers: endpoint.headers });
    fetchResult.then(function (resp) { return __awaiter(_this, void 0, void 0, function () {
        var parsedResponse, status, _a, _b, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    status = {};
                    status.error = false;
                    status.operation = endpoint.operation;
                    if (resp && resp.status) {
                        status.statusCode = resp.status;
                    }
                    if (!endpoint.ignoreBody) return [3 /*break*/, 1];
                    parsedResponse = {
                        headers: resp.headers,
                        redirects: [],
                        response: resp,
                    };
                    return [3 /*break*/, 4];
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, resp.text()];
                case 2:
                    parsedResponse = _b.apply(_a, [_c.sent()]);
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _c.sent();
                    status.errorData = resp;
                    status.error = true;
                    return [2 /*return*/, callback(status, null)];
                case 4:
                    if (parsedResponse.error &&
                        parsedResponse.error === 1 &&
                        parsedResponse.status &&
                        parsedResponse.message &&
                        parsedResponse.service) {
                        status.errorData = parsedResponse;
                        status.statusCode = parsedResponse.status;
                        status.error = true;
                        status.category = this._detectErrorCategory(status);
                        return [2 /*return*/, callback(status, null)];
                    }
                    if (parsedResponse.error && parsedResponse.error.message) {
                        status.errorData = parsedResponse.error;
                    }
                    // returning the entire response in order to use response methods for
                    // reading the body in react native because the response.body
                    // is a ReadableStream which doesn't seem to be reliable on ios and android
                    return [2 /*return*/, callback(status, { response: { body: resp } })];
            }
        });
    }); });
    fetchResult.catch(function (err) {
        var status = {};
        status.error = true;
        status.operation = endpoint.operation;
        if (err.response && err.response.text && !_this._config.logVerbosity) {
            try {
                status.errorData = JSON.parse(err.response.text);
            }
            catch (e) {
                status.errorData = err;
            }
        }
        else {
            status.errorData = err;
        }
        status.category = _this._detectErrorCategory(err);
        return callback(status, null);
    });
    return fetchResult;
}
exports.getfile = getfile;
