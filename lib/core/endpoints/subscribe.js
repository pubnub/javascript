'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = require('../flow_interfaces');

function getOperation() {
  return 'PNSubscribeOperation';
}

function validateParams(modules) {
  var config = modules.config;


  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann = incomingParams.channels;
  var channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return '/v2/subscribe/' + config.subscribeKey + '/' + encodeURIComponent(stringifiedChannels) + '/0';
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getSubscribeTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(_ref2, incomingParams) {
  var config = _ref2.config;
  var _incomingParams$chann2 = incomingParams.channelGroups;
  var channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;
  var timetoken = incomingParams.timetoken;
  var filterExpression = incomingParams.filterExpression;
  var region = incomingParams.region;

  var params = {
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

function handleResponse(modules, serverResponse) {
  var messages = [];

  serverResponse.m.forEach(function (rawMessage) {
    var publishMetaData = {
      publishTimetoken: rawMessage.p.t,
      region: rawMessage.p.r
    };
    var parsedMessage = {
      shard: parseInt(rawMessage.a, 10),
      subscriptionMatch: rawMessage.b,
      channel: rawMessage.c,
      payload: rawMessage.d,
      flags: rawMessage.f,
      issuingClientId: rawMessage.i,
      subscribeKey: rawMessage.k,
      originationTimetoken: rawMessage.o,
      publishMetaData: publishMetaData
    };
    messages.push(parsedMessage);
  });

  var metadata = {
    timetoken: serverResponse.t.t,
    region: serverResponse.t.r
  };

  return { messages: messages, metadata: metadata };
}
//# sourceMappingURL=subscribe.js.map
