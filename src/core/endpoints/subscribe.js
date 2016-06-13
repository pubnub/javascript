/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';

import Responders from '../presenters/responders';
import Logger from '../components/logger';
import BaseEndoint from './base.js';

import { endpointDefinition, statusStruct, PublishMetaData,
  SubscribeMetadata, SubscribeMessage, SubscribeEnvelope } from '../flow_interfaces';

type pubSubConstruct = {
  networking: Networking,
  config: Config,
};

type subscribeArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  timetoken: number,
  filterExpression: ?string,
}


export default class extends BaseEndoint {
  _networking: Networking;
  _config: Config;

  _r: Responders;
  _l: Logger;

  constructor({ networking, config }: pubSubConstruct) {
    super({ networking });
    this._networking = networking;
    this._config = config;
    this._r = new Responders('#endpoints/subscribe');
    this._l = Logger.getLogger('#endpoints/subscribe');
  }

  subscribe(args: subscribeArguments, callback: Function) {
    let { channels = [], channelGroups = [], timetoken, filterExpression, region } = args;
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    const endpointConfig: endpointDefinition = {
      params: {
        authKey: { required: false },
        uuid: {},
        subscribeKey: { required: true }
      },
      url: '/v2/subscribe/' + this._config.subscribeKey + '/' + encodeURIComponent(stringifiedChannels) + '/0'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (channelGroups.length > 0) {
      params['channel-group'] = channelGroups.join(',');
    }

    if (filterExpression && filterExpression.length > 0) {
      params['filter-expr'] = encodeURIComponent(filterExpression);
    }

    if (timetoken) {
      params.tt = timetoken;
    }

    if (region) {
      params.tr = region;
    }

    return this._networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      const messages: Array<SubscribeMessage> = [];

      payload.m.forEach((rawMessage) => {
        let publishMetaData: PublishMetaData = {
          publishTimetoken: rawMessage.p.t,
          region: rawMessage.p.r
        };
        let parsedMessage: SubscribeMessage = {
          shard: parseInt(rawMessage.a, 10),
          subscriptionMatch: rawMessage.b,
          channel: rawMessage.c,
          payload: rawMessage.d,
          flags: rawMessage.f,
          issuingClientId: rawMessage.i,
          subscribeKey: rawMessage.k,
          originationTimetoken: rawMessage.o,
          publishMetaData
        };
        messages.push(parsedMessage);
      });

      const metadata: SubscribeMetadata = {
        timetoken: payload.t.t,
        region: payload.t.r
      };
      const response: SubscribeEnvelope = { messages, metadata };

      callback(status, response);
    });
  }

  /*
  unsubscribe(args: unsubscribeArguments) {
    let { onStatus } = this._callbacks;
    let { channels = [], channelGroups = [] } = args;
    let existingChannels = []; // matching channels to unsubscribe
    let existingChannelGroups = []; // matching channel groups to unsubscribe
    let data = {};

    // Make sure we have a Channel
    if (!onStatus) {
      return this._l.error('Missing onStatus Callback');
    }

    if (channels.length === 0 && channelGroups.length === 0) {
      return onStatus(this._r.validationError('Missing Channel or Channel Group'));
    }

    if (channels) {
      channels.forEach((channel) => {
        if (this._state.containsChannel(channel)) {
          existingChannels.push(channel);
        }
      });
    }

    if (channelGroups) {
      channelGroups.forEach((channelGroup) => {
        if (this._state.containsChannelGroup(channelGroup)) {
          existingChannelGroups.push(channelGroup);
        }
      });
    }

    // if NO channels && channel groups to unsubscribe, trigger a callback
    if (existingChannels.length === 0 && existingChannelGroups.length === 0) {
      return onStatus(this._r.validationError('already unsubscribed from all channel / channel groups'));
    }

    let stringifiedChannelParam = existingChannels.length > 0 ? existingChannels.join(',') : ',';

    if (existingChannelGroups.length > 0) {
      data['channel-group'] = existingChannelGroups.join(',');
    }

    this._networking.performLeave(stringifiedChannelParam, data, (err, response) => {
      if (err) return onStatus(err, null);

      this._postUnsubscribeCleanup(existingChannels, existingChannelGroups);
      this._state.setSubscribeTimeToken('0');
      this._state.announceSubscriptionChange();
      onStatus(null, { action: 'unsubscribe', status: 'finished', response });
    });
  }
  */
}
