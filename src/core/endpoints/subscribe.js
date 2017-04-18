/* @flow */

import { SubscribeArguments, PublishMetaData, SubscribeMetadata, SubscribeMessage, SubscribeEnvelope, ModulesInject } from '../flow_interfaces';
import operationConstants from '../constants/operations';
import utils from '../utils';

export function getOperation(): string {
  return operationConstants.PNSubscribeOperation;
}

export function validateParams(modules: ModulesInject) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: SubscribeArguments): string {
  let { config } = modules;
  let { channels = [] } = incomingParams;
  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v2/subscribe/${config.subscribeKey}/${utils.encodeString(stringifiedChannels)}/0`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getSubscribeTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams({ config }: ModulesInject, incomingParams: SubscribeArguments): Object {
  let { channelGroups = [], timetoken, filterExpression, region } = incomingParams;
  const params: Object = {
    heartbeat: config.getPresenceTimeout()
  };

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  if (filterExpression && filterExpression.length > 0) {
    params['filter-expr'] = filterExpression;
  }

  if (timetoken) {
    params.tt = timetoken;
  }

  if (region) {
    params.tr = region;
  }

  return params;
}

export function handleResponse(modules: ModulesInject, serverResponse: Object): SubscribeEnvelope {
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
      userMetadata: rawMessage.u,
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
