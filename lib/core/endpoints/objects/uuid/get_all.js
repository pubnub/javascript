"use strict";
/**
 * Get All UUID Metadata REST API module.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllUUIDMetadataRequest = void 0;
var PubNubError_1 = require("../../../../models/PubNubError");
var request_1 = require("../../../components/request");
var operations_1 = __importDefault(require("../../../constants/operations"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `Channel` custom field should be included by default or not.
 */
var INCLUDE_CUSTOM_FIELDS = false;
/**
 * Whether to fetch total count or not.
 */
var INCLUDE_TOTAL_COUNT = false;
/**
 * Number of objects to return in response.
 */
var LIMIT = 100;
// endregion
var GetAllUUIDMetadataRequest = /** @class */ (function (_super) {
    __extends(GetAllUUIDMetadataRequest, _super);
    function GetAllUUIDMetadataRequest(parameters) {
        var _a, _b, _c, _d;
        var _e, _f;
        var _this = _super.call(this) || this;
        _this.parameters = parameters;
        // Apply default request parameters.
        (_a = parameters.include) !== null && _a !== void 0 ? _a : (parameters.include = {});
        (_b = (_e = parameters.include).customFields) !== null && _b !== void 0 ? _b : (_e.customFields = INCLUDE_CUSTOM_FIELDS);
        (_c = (_f = parameters.include).totalCount) !== null && _c !== void 0 ? _c : (_f.totalCount = INCLUDE_TOTAL_COUNT);
        (_d = parameters.limit) !== null && _d !== void 0 ? _d : (parameters.limit = LIMIT);
        return _this;
    }
    GetAllUUIDMetadataRequest.prototype.operation = function () {
        return operations_1.default.PNGetAllUUIDMetadataOperation;
    };
    GetAllUUIDMetadataRequest.prototype.parse = function (response) {
        return __awaiter(this, void 0, void 0, function () {
            var serviceResponse;
            return __generator(this, function (_a) {
                serviceResponse = this.deserializeResponse(response);
                if (!serviceResponse)
                    throw new PubNubError_1.PubNubError('Service response error, check status for details', (0, PubNubError_1.createValidationError)('Unable to deserialize service response'));
                return [2 /*return*/, serviceResponse];
            });
        });
    };
    Object.defineProperty(GetAllUUIDMetadataRequest.prototype, "path", {
        get: function () {
            return "/v2/objects/".concat(this.parameters.keySet.subscribeKey, "/uuids");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GetAllUUIDMetadataRequest.prototype, "queryParameters", {
        get: function () {
            var _a = this.parameters, include = _a.include, page = _a.page, filter = _a.filter, sort = _a.sort, limit = _a.limit;
            var sorting = Object.entries(sort !== null && sort !== void 0 ? sort : {}).map(function (_a) {
                var _b = __read(_a, 2), option = _b[0], order = _b[1];
                return order !== null ? "".concat(option, ":").concat(order) : option;
            });
            return __assign(__assign(__assign(__assign(__assign({ include: __spreadArray(['status', 'type'], __read((include.customFields ? ['custom'] : [])), false).join(','), count: "".concat(include.totalCount) }, (filter ? { filter: filter } : {})), ((page === null || page === void 0 ? void 0 : page.next) ? { start: page.next } : {})), ((page === null || page === void 0 ? void 0 : page.prev) ? { end: page.prev } : {})), (limit ? { limit: limit } : {})), (sorting.length ? { sort: sorting } : {}));
        },
        enumerable: false,
        configurable: true
    });
    return GetAllUUIDMetadataRequest;
}(request_1.AbstractRequest));
exports.GetAllUUIDMetadataRequest = GetAllUUIDMetadataRequest;
