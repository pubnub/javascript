"use strict";
/**       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var endpoint_1 = require("../../components/endpoint");
var utils_1 = __importDefault(require("../../utils"));
exports.default = (function (modules, _a) {
    var channel = _a.channel, id = _a.id, name = _a.name;
    var config = modules.config, networking = modules.networking;
    if (!channel) {
        throw new endpoint_1.PubNubError('Validation failed, check status for details', (0, endpoint_1.createValidationError)("channel can't be empty"));
    }
    if (!id) {
        throw new endpoint_1.PubNubError('Validation failed, check status for details', (0, endpoint_1.createValidationError)("file id can't be empty"));
    }
    if (!name) {
        throw new endpoint_1.PubNubError('Validation failed, check status for details', (0, endpoint_1.createValidationError)("file name can't be empty"));
    }
    var url = "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils_1.default.encodeString(channel), "/files/").concat(id, "/").concat(name);
    var params = {};
    params.uuid = config.getUUID();
    params.pnsdk = (0, endpoint_1.generatePNSDK)(config);
    if (config.getAuthKey()) {
        params.auth = config.getAuthKey();
    }
    if (config.secretKey) {
        (0, endpoint_1.signRequest)(modules, url, params, {}, {
            getOperation: function () { return 'PubNubGetFileUrlOperation'; },
        });
    }
    var queryParams = Object.keys(params)
        .map(function (key) { return "".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(params[key])); })
        .join('&');
    if (queryParams !== '') {
        return "".concat(networking.getStandardOrigin()).concat(url, "?").concat(queryParams);
    }
    return "".concat(networking.getStandardOrigin()).concat(url);
});
