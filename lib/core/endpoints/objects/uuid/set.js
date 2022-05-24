"use strict";
/**       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../../constants/operations"));
var utils_1 = __importDefault(require("../../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNSetUUIDMetadataOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.data)) {
            return 'Data cannot be empty';
        }
    },
    usePatch: function () { return true; },
    patchURL: function (_a, params) {
        var _b;
        var config = _a.config;
        return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(utils_1.default.encodeString((_b = params.uuid) !== null && _b !== void 0 ? _b : config.getUUID()));
    },
    patchPayload: function (_, params) { return params.data; },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_a, params) {
        var _b, _c, _d;
        var config = _a.config;
        return ({
            uuid: (_b = params === null || params === void 0 ? void 0 : params.uuid) !== null && _b !== void 0 ? _b : config.getUUID(),
            include: ((_d = (_c = params === null || params === void 0 ? void 0 : params.include) === null || _c === void 0 ? void 0 : _c.customFields) !== null && _d !== void 0 ? _d : true) && 'custom',
        });
    },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
    }); },
};
exports.default = endpoint;
