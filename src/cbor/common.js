import cbor from 'cbor-sync';

export default class {
  decodeToken(tokenString) {
    let padding = '';

    if (tokenString.length % 4 === 3) {
      padding = '=';
    } else if (tokenString.length % 4 === 2) {
      padding = '==';
    }

    let cleaned = tokenString.replace('-', '+').replace('_', '/') + padding;

    let result = cbor.decode(new Buffer.from(cleaned, 'base64'));

    if (typeof result === 'object') {
      return result;
    }

    return undefined;
  }
}
