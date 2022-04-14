export default class {
  _base64ToBinary;

  _cborReader;

  constructor(decode, base64ToBinary) {
    this._base64ToBinary = base64ToBinary;
    this._decode = decode;
  }

  decodeToken(tokenString) {
    let padding = '';

    if (tokenString.length % 4 === 3) {
      padding = '=';
    } else if (tokenString.length % 4 === 2) {
      padding = '==';
    }

    const cleaned = tokenString.replace(/-/gi, '+').replace(/_/gi, '/') + padding;
    const result = this._decode(this._base64ToBinary(cleaned));

    if (typeof result === 'object') {
      return result;
    }

    return undefined;
  }
}
