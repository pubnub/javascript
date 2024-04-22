"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationError = exports.PubNubError = void 0;
const categories_1 = __importDefault(require("../core/constants/categories"));
class PubNubError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'PubNubError';
        this.message = message;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.PubNubError = PubNubError;
function createError(errorPayload) {
    var _a;
    (_a = errorPayload.statusCode) !== null && _a !== void 0 ? _a : (errorPayload.statusCode = 0);
    return Object.assign(Object.assign({}, errorPayload), { statusCode: errorPayload.statusCode, category: categories_1.default.PNValidationErrorCategory, error: true });
}
function createValidationError(message, statusCode) {
    return createError(Object.assign({ message }, (statusCode !== undefined ? { statusCode } : {})));
}
exports.createValidationError = createValidationError;
