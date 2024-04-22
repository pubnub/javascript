"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encode = exports.decode = void 0;
const BASE64_CHARMAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function decode(paddedInput) {
    const input = paddedInput.replace(/==?$/, '');
    const outputLength = Math.floor((input.length / 4) * 3);
    const data = new ArrayBuffer(outputLength);
    const view = new Uint8Array(data);
    let cursor = 0;
    function nextSixtet() {
        const char = input.charAt(cursor++);
        const index = BASE64_CHARMAP.indexOf(char);
        if (index === -1) {
            throw new Error(`Illegal character at ${cursor}: ${input.charAt(cursor - 1)}`);
        }
        return index;
    }
    for (let i = 0; i < outputLength; i += 3) {
        const sx1 = nextSixtet();
        const sx2 = nextSixtet();
        const sx3 = nextSixtet();
        const sx4 = nextSixtet();
        const oc1 = ((sx1 & 0b00111111) << 2) | (sx2 >> 4);
        const oc2 = ((sx2 & 0b00001111) << 4) | (sx3 >> 2);
        const oc3 = ((sx3 & 0b00000011) << 6) | (sx4 >> 0);
        view[i] = oc1;
        if (sx3 != 64)
            view[i + 1] = oc2;
        if (sx4 != 64)
            view[i + 2] = oc3;
    }
    return data;
}
exports.decode = decode;
function encode(input) {
    let base64 = '';
    const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes = new Uint8Array(input);
    const byteLength = bytes.byteLength;
    const byteRemainder = byteLength % 3;
    const mainLength = byteLength - byteRemainder;
    let a, b, c, d;
    let chunk;
    for (let i = 0; i < mainLength; i = i + 3) {
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        a = (chunk & 16515072) >> 18;
        b = (chunk & 258048) >> 12;
        c = (chunk & 4032) >> 6;
        d = chunk & 63;
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }
    if (byteRemainder == 1) {
        chunk = bytes[mainLength];
        a = (chunk & 252) >> 2;
        b = (chunk & 3) << 4;
        base64 += encodings[a] + encodings[b] + '==';
    }
    else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
        a = (chunk & 64512) >> 10;
        b = (chunk & 1008) >> 4;
        c = (chunk & 15) << 2;
        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }
    return base64;
}
exports.encode = encode;
