/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';

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
  region: ?string,
}


export default class extends BaseEndoint {
  _networking: Networking;
  _config: Config;

  constructor({ networking, config }: pubSubConstruct) {
    super({ networking });
    this._networking = networking;
    this._config = config;
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
      timeout: this._config.getSubscribeTimeout(),
      url: '/v2/subscribe/' + this._config.subscribeKey + '/' + encodeURIComponent(stringifiedChannels) + '/0'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }
    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (channelGroups.length > 0) {
      params['channel-group'] = encodeURIComponent(channelGroups.join(','));
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
}
