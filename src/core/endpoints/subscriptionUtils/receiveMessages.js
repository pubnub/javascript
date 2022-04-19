import operationConstants from '../../constants/operations';
import utils from '../../utils';

const endpoint = {
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
    const channelsString = params.channels ? params.channels.join(',') : ',';
    return `/v2/subscribe/${config.subscribeKey}/${utils.encodeString(channelsString)}/0`;
  },

  getRequestTimeout: ({ config }) => config.getSubscribeTimeout(),

  isAuthSupported: () => true,

  getAbortSignal: (_, params) => params.abortSignal,

  prepareParams: (_, params) => {
    const outParams = {};
    if (params.channelGroups && params.channelGroups.length > 0) {
      outParams['channel-group'] = params.channelGroups.join(',');
    }
    outParams.tt = params.timetoken;
    outParams.tr = params.region;
    return outParams;
  },

  handleResponse: (_, response) => {
    const parsedMessages = [];

    response.m.forEach((envelope) => {
      const parsedMessage = {
        shard: parseInt(envelope.a, 10),
        subscriptionMatch: envelope.b,
        channel: envelope.c,
        messageType: envelope.e,
        payload: envelope.d,
        flags: envelope.f,
        issuingClientId: envelope.i,
        subscribeKey: envelope.k,
        originationTimetoken: envelope.o,
        publishMetaData: {
          timetoken: envelope.p.t,
          region: envelope.p.r,
        },
      };
      parsedMessages.push(parsedMessage);
    });
    return {
      messages: parsedMessages,
      metadata: {
        region: response.t.r,
        timetoken: response.t.t,
      },
    };
  },
};

export default endpoint;
