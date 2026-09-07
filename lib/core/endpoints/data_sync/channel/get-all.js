"use strict";
/**
 * Get Channels REST API module.
 *
 * @internal
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetChannelsRequest = void 0;
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const DataSync = __importStar(require("../../../types/api/data-sync"));
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
 * Get Channels request.
 *
 * @internal
 */
class GetChannelsRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a;
        super();
        this.parameters = parameters;
        // Apply defaults.
        (_a = parameters.limit) !== null && _a !== void 0 ? _a : (parameters.limit = DEFAULT_LIMIT);
    }
    operation() {
        return operations_1.default.PNGetDataSyncChannelsOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
            // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
            const parsed = this.deserializeResponse(response);
            return Object.assign(Object.assign({}, parsed), { status: response.status });
        });
    }
    get path() {
        return `/v1/datasync/subkeys/${this.parameters.keySet.subscribeKey}/channels`;
    }
    get queryParameters() {
        const { entityClass, entityClassVersion, entityClassLevel, cursor, limit, filter, filterFast, sort } = this.parameters;
        const sorting = DataSync.serializeDataSyncSort(sort);
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (entityClass ? { entity_class: entityClass } : {})), (entityClassVersion !== undefined ? { entity_class_version: `${entityClassVersion}` } : {})), (entityClassLevel ? { entity_class_level: entityClassLevel } : {})), (cursor ? { cursor } : {})), (limit ? { limit: `${limit}` } : {})), (filter ? { filter } : {})), (filterFast ? { filter_fast: filterFast } : {})), (sorting.length ? { sort: sorting } : {}));
    }
}
exports.GetChannelsRequest = GetChannelsRequest;
