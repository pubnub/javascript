"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var default_1 = /** @class */ (function () {
    function default_1(decode, base64ToBinary) {
        this._base64ToBinary = base64ToBinary;
        this._decode = decode;
    }
    default_1.prototype.decodeToken = function (tokenString) {
        var padding = '';
        if (tokenString.length % 4 === 3) {
            padding = '=';
        }
        else if (tokenString.length % 4 === 2) {
            padding = '==';
        }
        var cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
        var result = this._decode(this._base64ToBinary(cleaned));
        if (typeof result === 'object') {
            return result;
        }
        return undefined;
    };
    return default_1;
}());
exports.default = default_1;
