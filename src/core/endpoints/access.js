/* @flow */

import Networking from '../components/networking';
import Logger from '../components/logger';
import Responders from '../presenters/responders';

type accessConstruct = {
  networking: Networking,
};

type auditArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  authKeys: Array<string>,
}

type grantArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  ttl: number,
  read: boolean,
  write: boolean,
  manage: boolean,
  authKeys: Array<string>
}

export default class {
  _networking: Networking;
  _r: Responders;
  _l: Logger;

  constructor({ networking }: accessConstruct) {
    this._networking = networking;
    this._r = new Responders('#endpoints/PAM');
    this._l = Logger.getLogger('#endpoints/PAM');
  }

  revoke(args: Object, callback: Function) {
    args.read = false;
    args.write = false;
    this.grant(args, callback);
  }

  grant(args: grantArguments, callback: Function) {
    let { channels = [], channelGroups = [], ttl, read, write, manage, authKeys = [] } = args;

    let r = (read) ? '1' : '0';
    let w = (write) ? '1' : '0';
    let m = (manage) ? '1' : '0';

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    let timestamp = Math.floor(new Date().getTime() / 1000);

    let data: Object = { w, r, timestamp };

    if (typeof manage !== 'undefined') {
      data.m = m;
    }

    if (channels.length > 0) {
      data.channel = channels.join(',');
    }

    if (channelGroups.length > 0) {
      data['channel-group'] = channelGroups.join(',');
    }

    if (ttl || ttl === 0) {
      data.ttl = ttl;
    }

    let stringifiedAuthKeys = authKeys.length > 0 ? authKeys.join(',') : null;

    this._networking.performGrant(stringifiedAuthKeys, data, callback);
  }

  audit(args: auditArguments, callback: Function) {
    let { channels = [], channelGroups = [], authKeys = [] } = args;

    // Make sure we have a Channel
    if (!callback) {
      return this._l.error('Missing Callback');
    }

    let timestamp = Math.floor(new Date().getTime() / 1000);
    let data: Object = { timestamp };

    if (channels.length > 0) {
      data.channel = channels.join(',');
    }

    if (channelGroups.length > 0) {
      data['channel-group'] = channelGroups.join(',');
    }

    let stringifiedAuthKeys = authKeys.length > 0 ? authKeys.join(',') : null;

    this._networking.performAudit(stringifiedAuthKeys, data, callback);
  }

}
