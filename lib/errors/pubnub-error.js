import StatusCategory from '../core/constants/categories';
export class PubNubError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'PubnubError';
        this.message = message;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
function createError(errorPayload) {
    var _a;
    (_a = errorPayload.statusCode) !== null && _a !== void 0 ? _a : (errorPayload.statusCode = 0);
    return Object.assign(Object.assign({}, errorPayload), { statusCode: errorPayload.statusCode, category: StatusCategory.PNValidationErrorCategory, error: true });
}
export function createValidationError(message, statusCode) {
    return createError(Object.assign({ message }, (statusCode !== undefined ? { statusCode } : {})));
}
