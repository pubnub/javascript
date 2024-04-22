import PubNubCore from '../../../lib/node/index.js';

export interface Keyset {
  subscribeKey?: string;
  publishKey?: string;
}

export interface RetryConfiguration {
  delay?: number;
  maximumRetry?: number;
  shouldRetry: any;
  getDelay: any;
}

export interface Config extends Keyset {
  origin?: string;
  ssl?: boolean;
  suppressLeaveEvents?: boolean;
  logVerbosity?: boolean;
  uuid?: string;
  enableEventEngine?: boolean;
  retryConfiguration?: RetryConfiguration;
  heartbeatInterval?: number;
  presenceTimeout?: number;
}

const defaultConfig: Config = {
  origin: 'localhost:8090',
  ssl: false,
  suppressLeaveEvents: false,
  logVerbosity: false,
  uuid: 'myUUID',
};

export class PubNubManager {
  getInstance(config: Config = {}) {
    return new (PubNubCore as any)({ ...defaultConfig, ...config });
  }
}

export type PubNub = PubNubCore;
