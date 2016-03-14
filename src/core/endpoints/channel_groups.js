/* @flow */

import Networking from '../components/networking';
import Logger from '../components/logger';
import Responders from '../presenters/responders';

import utils from '../utils';

type channelGroupConstruct = {
  networking: Networking,
};

type channelGroupParams = {
  channelGroup: string,
  channels: ?Array<string> | ?string,
  channel: ?string
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
    let providedChannelGroupName = args.channelGroup;
    let channels = args.channels || args.channel;
    let effectiveChannelGroupName = '';

    let data = {};
    let mode = args.mode || 'add';

    if (providedChannelGroupName) {
      let splitChannelGroupName = providedChannelGroupName.split(':');

      if (splitChannelGroupName.length > 1) {
        effectiveChannelGroupName = splitChannelGroupName[1];
      } else {
        effectiveChannelGroupName = splitChannelGroupName[0];
      }
    }

    if (channels) {
      if (utils.isArray(channels)) {
        channels = channels.join(',');
      }
      data[mode] = channels;
    }

    this._networking.performChannelGroupOperation(effectiveChannelGroupName, mode, data, callback);
  }

  listChannels(args: Object, callback: Function) {
    if (!args.channelGroup) {
      return callback(this._r.validationError('Missing Channel Group'));
    }

    this.channelGroup(args, callback);
  }

  removeGroup(args: Object, callback: Function) {
    const errorMessage = 'Use channel_group_remove_channel if you want to remove a channel from a group.';
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

  addChannel(args: Object, callback: Function) {
    if (!args.channelGroup) {
      return callback(this._r.validationError('Missing Channel Group'));
    }

    if (!args.channel && !args.channels) {
      return callback(this._r.validationError('Missing Channel'));
    }
    this.channelGroup(args, callback);
  }

  removeChannel(args: Object, callback: Function) {
    if (!args.channelGroup) {
      return callback(this._r.validationError('Missing Channel Group'));
    }
    if (!args.channel && !args.channels) {
      return callback(this._r.validationError('Missing Channel'));
    }

    args.mode = 'remove';
    this.channelGroup(args, callback);
  }
}
