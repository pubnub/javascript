/*       */

import {
  SubscribeArguments,
  PublishMetaData,
  SubscribeMetadata,
  SubscribeMessage,
  SubscribeEnvelope,
  ModulesInject,
} from '../flow_interfaces';
import operationConstants from '../constants/operations';
import utils from '../utils';

export function getOperation() {
  return operationConstants.PNSubscribeOperation;
}

export function validateParams(modules) {
  const { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { config } = modules;
  const { channels = [] } = incomingParams;
  const stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v2/subscribe/${config.subscribeKey}/${utils.encodeString(stringifiedChannels)}/0`;
}

export function getRequestTimeout({ config }) {
  return config.getSubscribeTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams({ config }, incomingParams) {
  const { state, channelGroups = [], timetoken, filterExpression, region } = incomingParams;
  const params = {
    heartbeat: config.getPresenceTimeout(),
  };

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  if (filterExpression && filterExpression.length > 0) {
    params['filter-expr'] = filterExpression;
  }

  if (Object.keys(state).length) {
    params.state = JSON.stringify(state);
  }

  if (timetoken) {
    params.tt = timetoken;
  }

  if (region) {
    params.tr = region;
  }

  return params;
}

export function handleResponse(modules, serverResponse) {
  const messages = [];

  serverResponse.m.forEach((rawMessage) => {
    const publishMetaData = {
      publishTimetoken: rawMessage.p.t,
      region: rawMessage.p.r,
    };
    const parsedMessage = {
      shard: parseInt(rawMessage.a, 10),
      subscriptionMatch: rawMessage.b,
      channel: rawMessage.c,
      messageType: rawMessage.e,
      payload: rawMessage.d,
      flags: rawMessage.f,
      issuingClientId: rawMessage.i,
      subscribeKey: rawMessage.k,
      originationTimetoken: rawMessage.o,
      userMetadata: rawMessage.u,
      publishMetaData,
    };
    messages.push(parsedMessage);
  });

  const metadata = {
    timetoken: serverResponse.t.t,
    region: serverResponse.t.r,
  };

  return { messages, metadata };
}
