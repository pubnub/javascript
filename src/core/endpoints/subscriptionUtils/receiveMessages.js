/** @flow */

import type { EndpointConfig } from '../endpoint';
import operationConstants from '../../constants/operations';
import type { ReceiveMessagesParams, ReceiveMessagesResult } from './types';
import utils from '../../utils';

const endpoint : EndpointConfig<ReceiveMessagesParams, ReceiveMessagesResult> = {
  getOperation: () => operationConstants.PNReceiveMessagesOperation,

  validateParams: (_, params) => {
    if (!params?.channels && !params?.channelGroups) {
      return 'channels and channleGroups both should not be empty';
    }
    if (!params?.timetoken) {
      return 'timetoken can not be empty';
    }
    if (!params?.region) {
      return 'region can not be empty';
    }
  },

  getURL: ({ config }, params) => {
    let channelsString = params.channels ? params.channels.join(',') : ',';
    return `/v2/subscribe/${config.subscribeKey}/${utils.encodeString(channelsString)}/0`;
  },

  getRequestTimeout: ({ config }) => config.getSubscribeTimeout(),

  isAuthSupported: () => true,

  prepareParams: (_, params) => {
    const outParams = {};
    if (params.channelGroups) {
      outParams['channel-group'] = params.channelGroups.join(',');
    }
    outParams.tt = params.timetoken;
    outParams.tr = params.region;
    return outParams;
  },

  handleResponse: async (_, response): ReceiveMessagesResult => {
    const parsedMessages = [];

    response.m.forEach((message) => {
      let envelope = {
        shard: parseInt(message.a, 10),
        subscriptionMatch: message.b,
        channel: message.c,
        messageType: message.e,
        payload: message.d,
        flags: message.f,
        issuingClientId: message.i,
        subscribeKey: message.k,
        originationTimetoken: message.o,
        userMetadata: message.u,
        publishMetaData: {
          timetoken: message.p.t,
          region: message.p.r
        },
      };
      parsedMessages.push(envelope);
    });
    return {
      messages: parsedMessages,
      metadata: {
        region: response.t.r,
        timetoken: response.t.t
      }
    };
  }
};

export default endpoint;
