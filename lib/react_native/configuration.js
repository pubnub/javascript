"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaults = void 0;
var configuration_1 = require("../core/interfaces/configuration");
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 */
var setDefaults = function (configuration) {
    return (0, configuration_1.setDefaults)(configuration);
};
exports.setDefaults = setDefaults;
