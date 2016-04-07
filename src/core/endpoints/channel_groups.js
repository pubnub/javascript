/* @flow */

import Networking from '../components/networking';
import Logger from '../components/logger';
import Responders from '../presenters/responders';

type channelGroupConstruct = {
  networking: Networking,
};

type addChannelParams = {
  channels: Array<string>,
  channelGroup: string,
  mode: ?string, // added by the builder
}

type removeChannelParams = {
  channels: Array<string>,
  channelGroup: string,
  mode: ?string, // added by the builder
}

type channelGroupParams = {
  channelGroup: string,
  channels: Array<string>,
  mode: ?string, // added by the builder
}

export default class {
  _networking: Networking;
  _r: Responders;
  _l: Logger;

  constructor({ networking }: channelGroupConstruct) {
    this._networking = networking;
    this._r = new Responders('#endpoints/history');
    this._l = Logger.getLogger('#endpoints/history');
  }

  // generic function to handle all channel group operations
  channelGroup(args: channelGroupParams, callback: Function) {
    let { channelGroup, channels = [] } = args;

    let effectiveChannelGroupName = '';
    let data = {};
    let mode = args.mode || 'add';

    if (channelGroup) {
      let splitChannelGroupName = channelGroup.split(':');

      if (splitChannelGroupName.length > 1) {
        effectiveChannelGroupName = splitChannelGroupName[1];
      } else {
        effectiveChannelGroupName = splitChannelGroupName[0];
      }
    }

    if (channels.length > 0) {
      data[mode] = channels.join(',');
    }

    this._networking.performChannelGroupOperation(effectiveChannelGroupName, mode, data, callback);
  }

  listChannels(args: Object, callback: Function) {
    if (!args.channelGroup) {
      return callback(this._r.validationError('Missing Channel Group'));
    }

    this.channelGroup(args, callback);
  }

  deleteGroup(args: Object, callback: Function) {
    const errorMessage = 'Use removeChannel to remove a channel from a group.';
    if (!args.channelGroup) {
      return callback(this._r.validationError('Missing Channel Group'));
    }

    if (args.channel) {
      return callback(this._r.validationError(errorMessage));
    }

    args.mode = 'remove';
    this.channelGroup(args, callback);
  }

  listGroups(args: Object, callback: Function) {
    this.channelGroup(args, callback);
  }

  addChannels(args: addChannelParams, callback: Function) {
    let { channelGroup, channels = [] } = args;

    if (!channelGroup) {
      return callback(this._r.validationError('Missing Channel Group'));
    }

    if (channels.length === 0) {
      return callback(this._r.validationError('Missing Channel'));
    }

    args.mode = 'add';
    this.channelGroup(args, callback);
  }

  removeChannels(args: removeChannelParams, callback: Function) {
    let { channelGroup, channels = [] } = args;

    if (!channelGroup) {
      return callback(this._r.validationError('Missing Channel Group'));
    }
    if (channels.length === 0) {
      return callback(this._r.validationError('Missing Channel'));
    }

    args.mode = 'remove';
    this.channelGroup(args, callback);
  }
}
