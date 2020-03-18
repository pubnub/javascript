export default class {
  _base64ToBinary: (base64: string) => any;
  _cborReader: { decode: (any) => Object };

  constructor(decode: (any) => any, base64ToBinary: (base64: string) => any) {
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
