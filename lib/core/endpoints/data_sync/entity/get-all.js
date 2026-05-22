"use strict";
/**
 * Get All Entities REST API module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllEntitiesRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Default number of items per page.
 */
const DEFAULT_LIMIT = 20;
// endregion
/**
 * Get All Entities request.
 *
 * @internal
 */
class GetAllEntitiesRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a;
        super();
        this.parameters = parameters;
        // Apply defaults.
        (_a = parameters.limit) !== null && _a !== void 0 ? _a : (parameters.limit = DEFAULT_LIMIT);
    }
    operation() {
        return operations_1.default.PNGetAllEntitiesOperation;
    }
    validate() {
        if (!this.parameters.entityClass)
            return 'Entity class cannot be empty';
    }
    get path() {
        return `/subkeys/${this.parameters.keySet.subscribeKey}/entities`;
    }
    get queryParameters() {
        const { entityClass, entityClassVersion, cursor, limit, filter, sort, filterAdvanced } = this.parameters;
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ entity_class: entityClass }, (entityClassVersion !== undefined ? { entity_class_version: `${entityClassVersion}` } : {})), (cursor ? { cursor } : {})), (limit ? { limit: `${limit}` } : {})), (filter ? { filter } : {})), (sort ? { sort } : {})), (filterAdvanced ? { filter_advanced: filterAdvanced } : {}));
    }
}
exports.GetAllEntitiesRequest = GetAllEntitiesRequest;
