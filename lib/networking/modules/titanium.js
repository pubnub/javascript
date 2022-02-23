"use strict";
/*       */
/* global XMLHttpRequest, Ti */
Object.defineProperty(exports, "__esModule", { value: true });
exports.del = exports.patch = exports.post = exports.get = void 0;
var utils_1 = require("../utils");
function log(url, qs, res) {
    var _pickLogger = function () {
        if (Ti && Ti.API && Ti.API.log)
            return Ti.API;
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
    logger.log('-----');
}
function getHttpClient() {
    if (Ti.Platform.osname === 'mobileweb') {
        return new XMLHttpRequest();
    }
    return Ti.Network.createHTTPClient();
}
function keepAlive(xhr) {
    if (Ti.Platform.osname !== 'mobileweb' && this._config.keepAlive) {
        xhr.enableKeepAlive = true;
    }
}
function xdr(xhr, method, url, params, body, endpoint, callback) {
    var _this = this;
    var status = {};
    status.operation = endpoint.operation;
    xhr.open(method, (0, utils_1.buildUrl)(url, params), true);
    keepAlive.call(this, xhr);
    xhr.onload = function () {
        status.error = false;
        if (xhr.status) {
            status.statusCode = xhr.status;
        }
        var resp = JSON.parse(xhr.responseText);
        if (_this._config.logVerbosity) {
            log(url, params, xhr.responseText);
        }
        return callback(status, resp);
    };
    xhr.onerror = function (e) {
        status.error = true;
        status.errorData = e.error;
        status.category = _this._detectErrorCategory(e.error);
        return callback(status, null);
    };
    xhr.timeout = Ti.Platform.osname === 'android' ? 2147483647 : Infinity;
    xhr.send(body);
}
function get(params, endpoint, callback) {
    var xhr = getHttpClient();
    var url = this.getStandardOrigin() + endpoint.url;
    return xdr.call(this, xhr, 'GET', url, params, {}, endpoint, callback);
}
exports.get = get;
function post(params, body, endpoint, callback) {
    var xhr = getHttpClient();
    var url = this.getStandardOrigin() + endpoint.url;
    return xdr.call(this, xhr, 'POST', url, params, JSON.parse(body), endpoint, callback);
}
exports.post = post;
function patch(params, body, endpoint, callback) {
    var xhr = getHttpClient();
    var url = this.getStandardOrigin() + endpoint.url;
    return xdr.call(this, xhr, 'PATCH', url, params, JSON.parse(body), endpoint, callback);
}
exports.patch = patch;
function del(params, endpoint, callback) {
    var xhr = getHttpClient();
    var url = this.getStandardOrigin() + endpoint.url;
    return xdr.call(this, xhr, 'DELETE', url, params, {}, endpoint, callback);
}
exports.del = del;
