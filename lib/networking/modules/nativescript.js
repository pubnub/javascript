"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.del = exports.patch = exports.post = exports.get = void 0;
var http_1 = require("http");
var utils_1 = require("../utils");
function log(url, qs, res) {
    var _pickLogger = function () {
        if (console && console.log)
            return console; // eslint-disable-line no-console
        return console;
    };
    var start = new Date().getTime();
    var timestamp = new Date().toISOString();
    var logger = _pickLogger();
    logger.log('<<<<<'); // eslint-disable-line no-console
    logger.log("[".concat(timestamp, "]"), '\n', url, '\n', qs); // eslint-disable-line no-console
    logger.log('-----'); // eslint-disable-line no-console
    var now = new Date().getTime();
    var elapsed = now - start;
    var timestampDone = new Date().toISOString();
    logger.log('>>>>>>'); // eslint-disable-line no-console
    logger.log("[".concat(timestampDone, " / ").concat(elapsed, "]"), '\n', url, '\n', qs, '\n', res); // eslint-disable-line no-console
    logger.log('-----'); // eslint-disable-line no-console
}
function xdr(method, url, params, body, endpoint, callback) {
    var _this = this;
    var status = {};
    status.operation = endpoint.operation;
    var httpConfig = {
        method: method,
        url: (0, utils_1.buildUrl)(url, params),
        timeout: endpoint.timeout,
        content: body,
    };
    // $FlowFixMe
    return (0, http_1.request)(httpConfig)
        .then(function (response) {
        status.error = false;
        if (response.statusCode) {
            status.statusCode = response.statusCode;
        }
        return response.content.toJSON();
    })
        .then(function (response) {
        var resp = response;
        if (_this._config.logVerbosity) {
            log(url, params, resp);
        }
        callback(status, resp);
    })
        .catch(function (e) {
        status.error = true;
        status.errorData = e;
        status.category = _this._detectErrorCategory(e);
        callback(status, null);
    });
}
function get(params, endpoint, callback) {
    var url = this.getStandardOrigin() + endpoint.url;
    return xdr.call(this, 'GET', url, params, '', endpoint, callback);
}
exports.get = get;
function post(params, body, endpoint, callback) {
    var url = this.getStandardOrigin() + endpoint.url;
    return xdr.call(this, 'POST', url, params, body, endpoint, callback);
}
exports.post = post;
function patch(params, body, endpoint, callback) {
    var url = this.getStandardOrigin() + endpoint.url;
    return xdr.call(this, 'PATCH', url, params, body, endpoint, callback);
}
exports.patch = patch;
function del(params, endpoint, callback) {
    var url = this.getStandardOrigin() + endpoint.url;
    return xdr.call(this, 'DELETE', url, params, '', endpoint, callback);
}
exports.del = del;
