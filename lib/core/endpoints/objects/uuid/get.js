"use strict";
/**       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../../constants/operations"));
var utils_1 = __importDefault(require("../../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNGetUUIDMetadataOperation; },
    validateParams: function () {
        // No required parameters.
    },
    getURL: function (_a, params) {
        var _b;
        var config = _a.config;
        return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils_1.default.encodeString((_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()));
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_a, params) {
        var _b, _c;
        var config = _a.config;
        var queryParams = {};
        queryParams.uuid = (_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID();
        queryParams.include = ['status', 'type', 'custom'];
        if (params === null || params === void 0 ? void 0 : params.include) {
            if (((_c = params.include) === null || _c === void 0 ? void 0 : _c.customFields) === false) {
                queryParams.include.pop();
            }
        }
        queryParams.include = queryParams.include.join(',');
        return queryParams;
    },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
    }); },
};
exports.default = endpoint;
