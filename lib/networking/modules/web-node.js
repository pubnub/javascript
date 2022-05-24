"use strict";
/*       */
/* global window */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.del = exports.patch = exports.post = exports.get = exports.getfile = exports.postfile = void 0;
var superagent_1 = __importDefault(require("superagent"));
var categories_1 = __importDefault(require("../../core/constants/categories"));
function log(req) {
    var _pickLogger = function () {
        if (console && console.log)
            return console; // eslint-disable-line no-console
        if (window && window.console && window.console.log)
            return window.console;
        return console;
    };
    var start = new Date().getTime();
    var timestamp = new Date().toISOString();
    var logger = _pickLogger();
    logger.log('<<<<<');
    logger.log("[".concat(timestamp, "]"), '\n', req.url, '\n', req.qs);
    logger.log('-----');
    req.on('response', function (res) {
        var now = new Date().getTime();
        var elapsed = now - start;
        var timestampDone = new Date().toISOString();
        logger.log('>>>>>>');
        logger.log("[".concat(timestampDone, " / ").concat(elapsed, "]"), '\n', req.url, '\n', req.qs, '\n', res.text);
        logger.log('-----');
    });
}
function xdr(superagentConstruct, endpoint, callback) {
    var _this = this;
    if (this._config.logVerbosity) {
        superagentConstruct = superagentConstruct.use(log);
    }
    if (this._config.proxy && this._modules.proxy) {
        superagentConstruct = this._modules.proxy.call(this, superagentConstruct);
    }
    if (this._config.keepAlive && this._modules.keepAlive) {
        superagentConstruct = this._modules.keepAlive(superagentConstruct);
    }
    var sc = superagentConstruct;
    if (endpoint.abortSignal) {
        var unsubscribe_1 = endpoint.abortSignal.subscribe(function () {
            sc.abort();
            unsubscribe_1();
        });
    }
    if (endpoint.forceBuffered === true) {
        if (typeof Blob === 'undefined') {
            sc = sc.buffer().responseType('arraybuffer');
        }
        else {
            sc = sc.responseType('arraybuffer');
        }
    }
    else if (endpoint.forceBuffered === false) {
        sc = sc.buffer(false);
    }
    sc = sc.timeout(endpoint.timeout);
    sc.on('abort', function () {
        return callback({
            category: categories_1.default.PNUnknownCategory,
            error: true,
            operation: endpoint.operation,
            errorData: new Error('Aborted'),
        }, null);
    });
    sc.end(function (err, resp) {
        var parsedResponse;
        var status = {};
        status.error = err !== null;
        status.operation = endpoint.operation;
        if (resp && resp.status) {
            status.statusCode = resp.status;
        }
        if (err) {
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
        }
        if (endpoint.ignoreBody) {
            parsedResponse = {
                headers: resp.headers,
                redirects: resp.redirects,
                response: resp,
            };
        }
        else {
            try {
                parsedResponse = JSON.parse(resp.text);
            }
            catch (e) {
                status.errorData = resp;
                status.error = true;
                return callback(status, null);
            }
        }
        if (parsedResponse.error &&
            parsedResponse.error === 1 &&
            parsedResponse.status &&
            parsedResponse.message &&
            parsedResponse.service) {
            status.errorData = parsedResponse;
            status.statusCode = parsedResponse.status;
            status.error = true;
            status.category = _this._detectErrorCategory(status);
            return callback(status, null);
        }
        if (parsedResponse.error && parsedResponse.error.message) {
            status.errorData = parsedResponse.error;
        }
        return callback(status, parsedResponse);
    });
    return sc;
}
function postfile(url, fields, fileInput) {
    return __awaiter(this, void 0, void 0, function () {
        var agent, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    agent = superagent_1.default.post(url);
                    fields.forEach(function (_a) {
                        var key = _a.key, value = _a.value;
                        agent = agent.field(key, value);
                    });
                    agent.attach('file', fileInput, { contentType: 'application/octet-stream' });
                    return [4 /*yield*/, agent];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.postfile = postfile;
function getfile(params, endpoint, callback) {
    var superagentConstruct = superagent_1.default
        .get(this.getStandardOrigin() + endpoint.url)
        .set(endpoint.headers)
        .query(params);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
exports.getfile = getfile;
function get(params, endpoint, callback) {
    var superagentConstruct = superagent_1.default
        .get(this.getStandardOrigin() + endpoint.url)
        .set(endpoint.headers)
        .query(params);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
exports.get = get;
function post(params, body, endpoint, callback) {
    var superagentConstruct = superagent_1.default
        .post(this.getStandardOrigin() + endpoint.url)
        .query(params)
        .set(endpoint.headers)
        .send(body);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
exports.post = post;
function patch(params, body, endpoint, callback) {
    var superagentConstruct = superagent_1.default
        .patch(this.getStandardOrigin() + endpoint.url)
        .query(params)
        .set(endpoint.headers)
        .send(body);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
exports.patch = patch;
function del(params, endpoint, callback) {
    var superagentConstruct = superagent_1.default
        .delete(this.getStandardOrigin() + endpoint.url)
        .set(endpoint.headers)
        .query(params);
    return xdr.call(this, superagentConstruct, endpoint, callback);
}
exports.del = del;
