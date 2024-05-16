"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaults = void 0;
const configuration_1 = require("../core/interfaces/configuration");
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 *
 * @internal
 */
const setDefaults = (configuration) => {
    return (0, configuration_1.setDefaults)(configuration);
};
exports.setDefaults = setDefaults;
