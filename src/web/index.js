/* @flow */
/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator, window */

import CborReader from 'cbor-js';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import CryptoJS from '../core/components/cryptography/hmac-sha256';
import db from '../db/web';
import Cbor from '../cbor/common';
import { del, get, post, patch } from '../networking/modules/web-node';
import { InternalSetupStruct } from '../core/flow_interfaces';

function sendBeacon(url: string) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

function base64ToBinary(base64String: string) {
  const parsedWordArray = CryptoJS.enc.Base64.parse(base64String).words;
  const arrayBuffer = new ArrayBuffer(parsedWordArray.length * 4);
  const view = new Uint8Array(arrayBuffer);

  for (let wordIdx = 0; wordIdx < parsedWordArray.length; wordIdx += 1) {
    const word = parsedWordArray[wordIdx];
    const byteOffset = wordIdx * 4;
    view[byteOffset] = (word & 0xff000000) >> 24;
    view[byteOffset + 1] = (word & 0x00ff0000) >> 16;
    view[byteOffset + 2] = (word & 0x0000ff00) >> 8;
    view[byteOffset + 3] = (word & 0x000000ff);
  }

  return view.buffer;
}

function stringifyBufferKeys(obj) {
  const isObject = (value) => value && typeof value === 'object' && value.constructor === Object;
  const isString = (value) => typeof value === 'string' || value instanceof String;
  const isNumber = (value) => typeof value === 'number' && isFinite(value);

  if (!isObject(obj)) {
    return obj;
  }

  const normalizedObject = {};

  Object.keys(obj).forEach((key: any) => {
    const keyIsString = isString(key);
    let stringifiedKey = key;
    let value = obj[key];

    if (Array.isArray(key) || keyIsString && key.indexOf(',') >= 0) {
      const bytes: Array<any> = keyIsString ? key.split(',') : key;

      stringifiedKey = bytes.reduce((string, byte) => {
        string += (String.fromCharCode(byte));
        return string;
      }, '');
    } else if (isNumber(key) || keyIsString && !isNaN(key)) {
      stringifiedKey = String.fromCharCode(keyIsString ? parseInt(key, 10) : 10);
    }

    normalizedObject[stringifiedKey] = isObject(value) ? stringifyBufferKeys(value) : value;
  });

  return normalizedObject;
}

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    // extract config.
    const { listenToBrowserNetworkEvents = true } = setup;

    setup.db = db;
    setup.sdkFamily = 'Web';
    setup.networking = new Networking({ del, get, post, patch, sendBeacon });
    setup.cbor = new Cbor((arrayBuffer) => stringifyBufferKeys(CborReader.decode(arrayBuffer)), base64ToBinary);

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
