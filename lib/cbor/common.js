"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cbor {
    constructor(decode, base64ToBinary) {
        this.decode = decode;
        this.base64ToBinary = base64ToBinary;
    }
    decodeToken(tokenString) {
        let padding = '';
        if (tokenString.length % 4 === 3)
            padding = '=';
        else if (tokenString.length % 4 === 2)
            padding = '==';
        const cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
        const result = this.decode(this.base64ToBinary(cleaned));
        return typeof result === 'object' ? result : undefined;
    }
}
exports.default = Cbor;
