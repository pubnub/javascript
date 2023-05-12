import type PubNubType from 'pubnub';
import PubNub from '../../../lib/node/index.js';

export interface Keyset {
  subscribeKey?: string;
  publishKey?: string;
}

export interface Config extends Keyset {
  origin?: string;
  ssl?: boolean;
  suppressLeaveEvents?: boolean;
  logVerbosity?: boolean;
  uuid?: string;
  enableSubscribeBeta?: boolean;
}

const defaultConfig: Config = {
  origin: 'localhost:8090',
  ssl: false,
  suppressLeaveEvents: true,
  logVerbosity: false,
  uuid: 'myUUID',
};

export class PubNubManager {
  getInstance(config: Config = {}) {
    return new (PubNub as any)({ ...defaultConfig, ...config });
  }
}

export type PubNub = PubNubType;
