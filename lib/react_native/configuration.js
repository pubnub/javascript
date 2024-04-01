import { setDefaults as setBaseDefaults, } from '../core/interfaces/configuration';
/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 */
export const setDefaults = (configuration) => {
    return setBaseDefaults(configuration);
};
