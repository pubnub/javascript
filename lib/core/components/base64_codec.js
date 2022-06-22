"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = void 0;
var BASE64_CHARMAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
/**
 * Decode a Base64 encoded string.
 *
 * @param paddedInput Base64 string with padding
 * @returns ArrayBuffer with decoded data
 */
function decode(paddedInput) {
    // Remove up to last two equal signs.
    var input = paddedInput.replace(/==?$/, '');
    var outputLength = Math.floor((input.length / 4) * 3);
    // Prepare output buffer.
    var data = new ArrayBuffer(outputLength);
    var view = new Uint8Array(data);
    var cursor = 0;
    /**
     * Returns the next integer representation of a sixtet of bytes from the input
     * @returns sixtet of bytes
     */
    function nextSixtet() {
        var char = input.charAt(cursor++);
        var index = BASE64_CHARMAP.indexOf(char);
        if (index === -1) {
            throw new Error("Illegal character at ".concat(cursor, ": ").concat(input.charAt(cursor - 1)));
        }
        return index;
    }
    for (var i = 0; i < outputLength; i += 3) {
        // Obtain four sixtets
        var sx1 = nextSixtet();
        var sx2 = nextSixtet();
        var sx3 = nextSixtet();
        var sx4 = nextSixtet();
        // Encode them as three octets
        var oc1 = ((sx1 & 63) << 2) | (sx2 >> 4);
        var oc2 = ((sx2 & 15) << 4) | (sx3 >> 2);
        var oc3 = ((sx3 & 3) << 6) | (sx4 >> 0);
        view[i] = oc1;
        // Skip padding bytes.
        if (sx3 != 64)
            view[i + 1] = oc2;
        if (sx4 != 64)
            view[i + 2] = oc3;
    }
    return data;
}
exports.decode = decode;
