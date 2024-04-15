import { setDefaults as setBaseDefaults, } from '../core/interfaces/configuration';
const KEEP_ALIVE = false;
export const setDefaults = (configuration) => {
    var _a;
    return Object.assign(Object.assign({}, setBaseDefaults(configuration)), { keepAlive: (_a = configuration.keepAlive) !== null && _a !== void 0 ? _a : KEEP_ALIVE });
};
