/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator, window */

import CborReader from 'cbor-js';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import { decode } from '../core/components/base64_codec';
import Cbor from '../cbor/common';
import { del, get, post, patch, getfile, postfile } from '../networking/modules/web-node';

import WebCryptography from '../crypto/modules/web';
import PubNubFile from '../file/modules/web';

function sendBeacon(url) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

export function stringifyBufferKeys(obj) {
  const isObject = (value) => value && typeof value === 'object' && value.constructor === Object;
  const isString = (value) => typeof value === 'string' || value instanceof String;
  const isNumber = (value) => typeof value === 'number' && isFinite(value);

  if (!isObject(obj)) {
    return obj;
  }

  const normalizedObject = {};

  Object.keys(obj).forEach((key) => {
    const keyIsString = isString(key);
    let stringifiedKey = key;
    const value = obj[key];

    if (Array.isArray(key) || (keyIsString && key.indexOf(',') >= 0)) {
      const bytes = keyIsString ? key.split(',') : key;

      stringifiedKey = bytes.reduce((string, byte) => {
        string += String.fromCharCode(byte);
        return string;
      }, '');
    } else if (isNumber(key) || (keyIsString && !isNaN(key))) {
      stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
    }

    normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
  });

  return normalizedObject;
}

export default class extends PubNubCore {
  constructor(setup) {
    // extract config.
    const { listenToBrowserNetworkEvents = true } = setup;

    setup.sdkFamily = 'Web';
    setup.networking = new Networking({
      del,
      get,
      post,
      patch,
      sendBeacon,
      getfile,
      postfile,
    });
    setup.cbor = new Cbor((arrayBuffer) => stringifyBufferKeys(CborReader.decode(arrayBuffer)), decode);

    setup.PubNubFile = PubNubFile;
    setup.cryptography = new WebCryptography();

    super(setup);

    if (listenToBrowserNetworkEvents) {
      // mount network events.
      window.addEventListener('offline', () => {
        this.networkDownDetected();
      });

      window.addEventListener('online', () => {
        this.networkUpDetected();
      });
    }
  }
}
