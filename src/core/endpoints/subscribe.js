/* @flow */

import { SubscribeArguments, PublishMetaData, SubscribeMetadata, SubscribeMessage, SubscribeEnvelope } from '../flow_interfaces';

export function getOperation(): string {
  return 'PNSubscribeOperation';
}

export function validateParams(modules) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: SubscribeArguments): string {
  let { config } = modules;
  let { channels = [] } = incomingParams;
  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return '/v2/subscribe/' + config.subscribeKey + '/' + encodeURIComponent(stringifiedChannels) + '/0';
}

export function prepareParams(modules, incomingParams: SubscribeArguments): Object {
  let { channelGroups = [], timetoken, filterExpression, region } = incomingParams;
  const params = {};

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

  return params;
}

export function handleResponse(modules, serverResponse: Object): SubscribeEnvelope {
  const messages: Array<SubscribeMessage> = [];

  serverResponse.m.forEach((rawMessage) => {
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
    timetoken: serverResponse.t.t,
    region: serverResponse.t.r
  };

  return { messages, metadata };
}
