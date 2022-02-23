/*       */

import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNMessageCounts;
}

export function validateParams(modules, incomingParams) {
  const { channels, timetoken, channelTimetokens } = incomingParams;
  const { config } = modules;

  if (!channels) return 'Missing channel';
  if (timetoken && channelTimetokens) return 'timetoken and channelTimetokens are incompatible together';
  if (timetoken && channelTimetokens && channelTimetokens.length > 1 && channels.length !== channelTimetokens.length) {
    return 'Length of channelTimetokens and channels do not match';
  }
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { channels } = incomingParams;
  const { config } = modules;

  const stringifiedChannels = channels.join(',');

  return `/v3/history/sub-key/${config.subscribeKey}/message-counts/${utils.encodeString(stringifiedChannels)}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { timetoken, channelTimetokens } = incomingParams;
  const outgoingParams = {};

  if (channelTimetokens && channelTimetokens.length === 1) {
    const [tt] = channelTimetokens;
    outgoingParams.timetoken = tt;
  } else if (channelTimetokens) {
    outgoingParams.channelsTimetoken = channelTimetokens.join(',');
  } else if (timetoken) {
    outgoingParams.timetoken = timetoken;
  }

  return outgoingParams;
}

export function handleResponse(modules, serverResponse) {
  return { channels: serverResponse.channels };
}
