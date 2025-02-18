"use strict";
/**
 * Network request module.
 *
 * @internal
 */
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
exports.AbstractRequest = void 0;
const transport_request_1 = require("../types/transport-request");
const pubnub_error_1 = require("../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../errors/pubnub-api-error");
const uuid_1 = __importDefault(require("./uuid"));
/**
 * Base REST API request class.
 *
 * @internal
 */
class AbstractRequest {
    /**
     * Construct base request.
     *
     * Constructed request by default won't be cancellable and performed using `GET` HTTP method.
     *
     * @param params - Request configuration parameters.
     */
    constructor(params) {
        this.params = params;
        /**
         * Unique request identifier.
         */
        this.requestIdentifier = uuid_1.default.createUUID();
        this._cancellationController = null;
    }
    /**
     * Retrieve configured cancellation controller.
     *
     * @returns Cancellation controller.
     */
    get cancellationController() {
        return this._cancellationController;
    }
    /**
     * Update request cancellation controller.
     *
     * Controller itself provided by transport provider implementation and set only when request
     * sending has been scheduled.
     *
     * @param controller - Cancellation controller or `null` to reset it.
     */
    set cancellationController(controller) {
        this._cancellationController = controller;
    }
    /**
     * Abort request if possible.
     *
     * @param [reason] Information about why request has been cancelled.
     */
    abort(reason) {
        if (this && this.cancellationController)
            this.cancellationController.abort(reason);
    }
    /**
     * Target REST API endpoint operation type.
     */
    operation() {
        throw Error('Should be implemented by subclass.');
    }
    /**
     * Validate user-provided data before scheduling request.
     *
     * @returns Error message if request can't be sent without missing or malformed parameters.
     */
    validate() {
        return undefined;
    }
    /**
     * Parse service response.
     *
     * @param response - Raw service response which should be parsed.
     */
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.deserializeResponse(response);
        });
    }
    /**
     * Create platform-agnostic request object.
     *
     * @returns Request object which can be processed using platform-specific requirements.
     */
    request() {
        var _a, _b, _c, _d;
        const request = {
            method: (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.method) !== null && _b !== void 0 ? _b : transport_request_1.TransportMethod.GET,
            path: this.path,
            queryParameters: this.queryParameters,
            cancellable: (_d = (_c = this.params) === null || _c === void 0 ? void 0 : _c.cancellable) !== null && _d !== void 0 ? _d : false,
            timeout: 10,
            identifier: this.requestIdentifier,
        };
        // Attach headers (if required).
        const headers = this.headers;
        if (headers)
            request.headers = headers;
        // Attach body (if required).
        if (request.method === transport_request_1.TransportMethod.POST || request.method === transport_request_1.TransportMethod.PATCH) {
            const [body, formData] = [this.body, this.formData];
            if (formData)
                request.formData = formData;
            if (body)
                request.body = body;
        }
        return request;
    }
    /**
     * Target REST API endpoint request headers getter.
     *
     * @returns Key/value headers which should be used with request.
     */
    get headers() {
        return undefined;
    }
    /**
     * Target REST API endpoint request path getter.
     *
     * @returns REST API path.
     */
    get path() {
        throw Error('`path` getter should be implemented by subclass.');
    }
    /**
     * Target REST API endpoint request query parameters getter.
     *
     * @returns Key/value pairs which should be appended to the REST API path.
     */
    get queryParameters() {
        return {};
    }
    get formData() {
        return undefined;
    }
    /**
     * Target REST API Request body payload getter.
     *
     * @returns Buffer of stringified data which should be sent with `POST` or `PATCH` request.
     */
    get body() {
        return undefined;
    }
    /**
     * Deserialize service response.
     *
     * @param response - Transparent response object with headers and body information.
     *
     * @returns Deserialized service response data.
     *
     * @throws {Error} if received service response can't be processed (has unexpected content-type or can't be parsed as
     * JSON).
     */
    deserializeResponse(response) {
        const responseText = AbstractRequest.decoder.decode(response.body);
        const contentType = response.headers['content-type'];
        let parsedJson;
        if (!contentType || (contentType.indexOf('javascript') === -1 && contentType.indexOf('json') === -1))
            throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createMalformedResponseError)(responseText, response.status));
        try {
            parsedJson = JSON.parse(responseText);
        }
        catch (error) {
            console.error('Error parsing JSON response:', error);
            throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createMalformedResponseError)(responseText, response.status));
        }
        // Throw and exception in case of client / server error.
        if ('status' in parsedJson && typeof parsedJson.status === 'number' && parsedJson.status >= 400)
            throw pubnub_api_error_1.PubNubAPIError.create(response);
        return parsedJson;
    }
}
exports.AbstractRequest = AbstractRequest;
/**
 * Service `ArrayBuffer` response decoder.
 */
AbstractRequest.decoder = new TextDecoder();
