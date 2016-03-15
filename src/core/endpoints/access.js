/* @flow */

import Networking from '../components/networking';
import Logger from '../components/logger';
import Responders from '../presenters/responders';

import utils from '../utils';

type accessConstruct = {
  networking: Networking,
};

type auditArguments = {
  channel: string,
  channelGroup: string,
  authKey: string,
}

type grantArguments = {
  channel: string | Array<string>,
  channelGroup: string,
  ttl: number,
  read: boolean,
  write: boolean,
  manage: boolean,
  authKey: string | Array<string>
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
    let { channel, channelGroup, ttl, read, write, manage, authKey } = args;

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

    if (utils.isArray(channel)) {
      channel = channel.join(',');
    }
    if (utils.isArray(authKey)) {
      authKey = authKey.join(',');
    }

    if (channel) {
      data.channel = channel;
    }

    if (channelGroup) {
      data['channel-group'] = channelGroup;
    }

    if (ttl || ttl === 0) {
      data.ttl = ttl;
    }

    this._networking.performGrant(authKey, data, callback);
  }

  audit(args: auditArguments, callback: Function) {
    let { channel, channelGroup, authKey } = args;

    // Make sure we have a Channel
    if (!callback) {
      return this._l.error('Missing Callback');
    }

    let timestamp = Math.floor(new Date().getTime() / 1000);
    let data: Object = { timestamp };

    if (channel) {
      data.channel = channel;
    }

    if (channelGroup) {
      data['channel-group'] = channelGroup;
    }

    this._networking.performAudit(authKey, data, callback);
  }

}
