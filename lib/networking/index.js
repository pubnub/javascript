"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var categories_1 = __importDefault(require("../core/constants/categories"));
var default_1 = /** @class */ (function () {
    function default_1(modules) {
        var _this = this;
        this._modules = {};
        Object.keys(modules).forEach(function (key) {
            _this._modules[key] = modules[key].bind(_this);
        });
    }
    default_1.prototype.init = function (config) {
        this._config = config;
        if (Array.isArray(this._config.origin)) {
            this._currentSubDomain = Math.floor(Math.random() * this._config.origin.length);
        }
        else {
            this._currentSubDomain = 0;
        }
        this._coreParams = {};
        // create initial origins
        this.shiftStandardOrigin();
    };
    default_1.prototype.nextOrigin = function () {
        var protocol = this._config.secure ? 'https://' : 'http://';
        if (typeof this._config.origin === 'string') {
            return "".concat(protocol).concat(this._config.origin);
        }
        this._currentSubDomain += 1;
        if (this._currentSubDomain >= this._config.origin.length) {
            this._currentSubDomain = 0;
        }
        var origin = this._config.origin[this._currentSubDomain];
        return "".concat(protocol).concat(origin);
    };
    default_1.prototype.hasModule = function (name) {
        return name in this._modules;
    };
    // origin operations
    default_1.prototype.shiftStandardOrigin = function () {
        this._standardOrigin = this.nextOrigin();
        return this._standardOrigin;
    };
    default_1.prototype.getStandardOrigin = function () {
        return this._standardOrigin;
    };
    default_1.prototype.POSTFILE = function (url, fields, file) {
        return this._modules.postfile(url, fields, file);
    };
    default_1.prototype.GETFILE = function (params, endpoint, callback) {
        return this._modules.getfile(params, endpoint, callback);
    };
    default_1.prototype.POST = function (params, body, endpoint, callback) {
        return this._modules.post(params, body, endpoint, callback);
    };
    default_1.prototype.PATCH = function (params, body, endpoint, callback) {
        return this._modules.patch(params, body, endpoint, callback);
    };
    default_1.prototype.GET = function (params, endpoint, callback) {
        return this._modules.get(params, endpoint, callback);
    };
    default_1.prototype.DELETE = function (params, endpoint, callback) {
        return this._modules.del(params, endpoint, callback);
    };
    default_1.prototype._detectErrorCategory = function (err) {
        if (err.code === 'ENOTFOUND') {
            return categories_1.default.PNNetworkIssuesCategory;
        }
        if (err.code === 'ECONNREFUSED') {
            return categories_1.default.PNNetworkIssuesCategory;
        }
        if (err.code === 'ECONNRESET') {
            return categories_1.default.PNNetworkIssuesCategory;
        }
        if (err.code === 'EAI_AGAIN') {
            return categories_1.default.PNNetworkIssuesCategory;
        }
        if (err.status === 0 || (err.hasOwnProperty('status') && typeof err.status === 'undefined')) {
            return categories_1.default.PNNetworkIssuesCategory;
        }
        if (err.timeout)
            return categories_1.default.PNTimeoutCategory;
        if (err.code === 'ETIMEDOUT') {
            return categories_1.default.PNNetworkIssuesCategory;
        }
        if (err.response) {
            if (err.response.badRequest) {
                return categories_1.default.PNBadRequestCategory;
            }
            if (err.response.forbidden) {
                return categories_1.default.PNAccessDeniedCategory;
            }
        }
        return categories_1.default.PNUnknownCategory;
    };
    return default_1;
}());
exports.default = default_1;
