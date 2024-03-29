"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRequest = void 0;
var transport_request_1 = require("../types/transport-request");
var uuid_1 = __importDefault(require("./uuid"));
/**
 * Base REST API request class.
 */
var AbstractRequest = /** @class */ (function () {
    /**
     * Construct base request.
     *
     * Constructed request by default won't be cancellable and performed using `GET` HTTP method.
     *
     * @param params - Request configuration parameters.
     */
    function AbstractRequest(params) {
        this.params = params;
        this._cancellationController = null;
    }
    Object.defineProperty(AbstractRequest.prototype, "cancellationController", {
        /**
         * Retrieve configured cancellation controller.
         *
         * @returns Cancellation controller.
         */
        get: function () {
            return this._cancellationController;
        },
        /**
         * Update request cancellation controller.
         *
         * Controller itself provided by transport provider implementation and set only when request
         * sending has been scheduled.
         *
         * @param controller - Cancellation controller or `null` to reset it.
         */
        set: function (controller) {
            this._cancellationController = controller;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Abort request if possible.
     */
    AbstractRequest.prototype.abort = function () {
        if (this.cancellationController)
            this.cancellationController.abort();
    };
    /**
     * Target REST API endpoint operation type.
     */
    AbstractRequest.prototype.operation = function () {
        throw Error('Should be implemented by subclass.');
    };
    /**
     * Validate user-provided data before scheduling request.
     *
     * @returns Error message if request can't be sent without missing or malformed parameters.
     */
    AbstractRequest.prototype.validate = function () {
        return undefined;
    };
    /**
     * Parse service response.
     *
     * @param _response - Raw service response which should be parsed.
     */
    AbstractRequest.prototype.parse = function (_response) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw Error('Should be implemented by subclass.');
            });
        });
    };
    /**
     * Create platform-agnostic request object.
     *
     * @returns Request object which can be processed using platform-specific requirements.
     */
    AbstractRequest.prototype.request = function () {
        var _a, _b, _c, _d;
        var request = {
            method: (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.method) !== null && _b !== void 0 ? _b : transport_request_1.TransportMethod.GET,
            path: this.path,
            queryParameters: this.queryParameters,
            cancellable: (_d = (_c = this.params) === null || _c === void 0 ? void 0 : _c.cancellable) !== null && _d !== void 0 ? _d : false,
            timeout: 10000,
            identifier: uuid_1.default.createUUID(),
        };
        // Attach headers (if required).
        var headers = this.headers;
        if (headers)
            request.headers = headers;
        // Attach body (if required).
        if (request.method === transport_request_1.TransportMethod.POST || request.method === transport_request_1.TransportMethod.PATCH) {
            var _e = __read([this.body, this.formData], 2), body = _e[0], formData = _e[1];
            if (formData)
                request.formData = formData;
            if (body)
                request.body = body;
        }
        return request;
    };
    Object.defineProperty(AbstractRequest.prototype, "headers", {
        /**
         * Target REST API endpoint request headers getter.
         *
         * @returns Key/value headers which should be used with request.
         */
        get: function () {
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AbstractRequest.prototype, "path", {
        /**
         * Target REST API endpoint request path getter.
         *
         * @returns REST API path.
         */
        get: function () {
            throw Error('`path` getter should be implemented by subclass.');
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AbstractRequest.prototype, "queryParameters", {
        /**
         * Target REST API endpoint request query parameters getter.
         *
         * @returns Key/value pairs which should be appended to the REST API path.
         */
        get: function () {
            return {};
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AbstractRequest.prototype, "formData", {
        get: function () {
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(AbstractRequest.prototype, "body", {
        /**
         * Target REST API Request body payload getter.
         *
         * @returns Buffer of stringified data which should be sent with `POST` or `PATCH` request.
         */
        get: function () {
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Deserialize service response.
     *
     * @param response - Transparent response object with headers and body information.
     *
     * @returns Deserialized data or `undefined` in case of `JSON.parse(..)` error.
     */
    AbstractRequest.prototype.deserializeResponse = function (response) {
        var contentType = response.headers['content-type'];
        if (contentType.indexOf('javascript') === -1 || contentType.indexOf('json') === -1)
            return undefined;
        var json = AbstractRequest.decoder.decode(response.body);
        try {
            var parsedJson = JSON.parse(json);
            return parsedJson;
        }
        catch (error) {
            console.error('Error parsing JSON response:', error);
            return undefined;
        }
    };
    /**
     * Service `ArrayBuffer` response decoder.
     */
    AbstractRequest.decoder = new TextDecoder();
    return AbstractRequest;
}());
exports.AbstractRequest = AbstractRequest;
