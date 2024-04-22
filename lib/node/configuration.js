"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaults = void 0;
const configuration_1 = require("../core/interfaces/configuration");
const KEEP_ALIVE = false;
const setDefaults = (configuration) => {
    var _a;
    return Object.assign(Object.assign({}, (0, configuration_1.setDefaults)(configuration)), { keepAlive: (_a = configuration.keepAlive) !== null && _a !== void 0 ? _a : KEEP_ALIVE });
};
exports.setDefaults = setDefaults;
