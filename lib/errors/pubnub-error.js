"use strict";
/**
 * PubNub operation error module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubError = void 0;
exports.createValidationError = createValidationError;
exports.createMalformedResponseError = createMalformedResponseError;
const categories_1 = __importDefault(require("../core/constants/categories"));
/**
 * PubNub operation error.
 *
 * When an operation can't be performed or there is an error from the server, this object will be returned.
 */
class PubNubError extends Error {
    /**
     * Create PubNub operation error.
     *
     * @param message - Message with details about why operation failed.
     * @param [status] - Additional information about performed operation.
     *
     * @returns Configured and ready to use PubNub operation error.
     *
     * @internal
     */
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'PubNubError';
        this.message = message;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.PubNubError = PubNubError;
/**
 * Create error status object.
 *
 * @param errorPayload - Additional information which should be attached to the error status object.
 * @param category - Occurred error category.
 *
 * @returns Error status object.
 *
 * @internal
 */
function createError(errorPayload, category) {
    var _a;
    (_a = errorPayload.statusCode) !== null && _a !== void 0 ? _a : (errorPayload.statusCode = 0);
    return Object.assign(Object.assign({}, errorPayload), { statusCode: errorPayload.statusCode, category, error: true });
}
/**
 * Create operation arguments validation error status object.
 *
 * @param message - Information about failed validation requirement.
 * @param [statusCode] - Operation HTTP status code.
 *
 * @returns Operation validation error status object.
 *
 * @internal
 */
function createValidationError(message, statusCode) {
    return createError(Object.assign({ message }, (statusCode !== undefined ? { statusCode } : {})), categories_1.default.PNValidationErrorCategory);
}
/**
 * Create malformed service response error status object.
 *
 * @param [responseText] - Stringified original service response.
 * @param [statusCode] - Operation HTTP status code.
 */
function createMalformedResponseError(responseText, statusCode) {
    return createError(Object.assign(Object.assign({ message: 'Unable to deserialize service response' }, (responseText !== undefined ? { responseText } : {})), (statusCode !== undefined ? { statusCode } : {})), categories_1.default.PNMalformedResponseCategory);
}
