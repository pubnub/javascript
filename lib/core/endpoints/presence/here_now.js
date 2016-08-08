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

var _flow_interfaces = require('../../flow_interfaces');

function getOperation() {
  return 'PNHereNowOperation';
}

function validateParams(modules) {
  var config = modules.config;


  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann = incomingParams.channels;
  var channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;
  var _incomingParams$chann2 = incomingParams.channelGroups;
  var channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;

  var baseURL = '/v2/presence/sub-key/' + config.subscribeKey;

  if (channels.length > 0 || channelGroups.length > 0) {
    var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    baseURL += '/channel/' + encodeURIComponent(stringifiedChannels);
  }

  return baseURL;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var _incomingParams$chann3 = incomingParams.channelGroups;
  var channelGroups = _incomingParams$chann3 === undefined ? [] : _incomingParams$chann3;
  var _incomingParams$inclu = incomingParams.includeUUIDs;
  var includeUUIDs = _incomingParams$inclu === undefined ? true : _incomingParams$inclu;
  var _incomingParams$inclu2 = incomingParams.includeState;
  var includeState = _incomingParams$inclu2 === undefined ? false : _incomingParams$inclu2;

  var params = {};

  if (!includeUUIDs) params.disable_uuids = 1;
  if (includeState) params.state = 1;

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

function handleResponse(modules, serverResponse, incomingParams) {
  var _incomingParams$chann4 = incomingParams.channels;
  var channels = _incomingParams$chann4 === undefined ? [] : _incomingParams$chann4;
  var _incomingParams$chann5 = incomingParams.channelGroups;
  var channelGroups = _incomingParams$chann5 === undefined ? [] : _incomingParams$chann5;
  var _incomingParams$inclu3 = incomingParams.includeUUIDs;
  var includeUUIDs = _incomingParams$inclu3 === undefined ? true : _incomingParams$inclu3;
  var _incomingParams$inclu4 = incomingParams.includeState;
  var includeState = _incomingParams$inclu4 === undefined ? false : _incomingParams$inclu4;


  var prepareSingularChannel = function prepareSingularChannel() {
    var response = {};
    var occupantsList = [];
    response.totalChannels = 1;
    response.totalOccupancy = serverResponse.occupancy;
    response.channels = {};
    response.channels[channels[0]] = {
      occupants: occupantsList,
      name: channels[0],
      occupancy: serverResponse.occupancy
    };

    if (includeUUIDs) {
      serverResponse.uuids.forEach(function (uuidEntry) {
        if (includeState) {
          occupantsList.push({ state: uuidEntry.state, uuid: uuidEntry.uuid });
        } else {
          occupantsList.push({ state: null, uuid: uuidEntry });
        }
      });
    }

    return response;
  };

  var prepareMultipleChannel = function prepareMultipleChannel() {
    var response = {};
    response.totalChannels = serverResponse.payload.total_channels;
    response.totalOccupancy = serverResponse.payload.total_occupancy;
    response.channels = {};

    Object.keys(serverResponse.payload.channels).forEach(function (channelName) {
      var channelEntry = serverResponse.payload.channels[channelName];
      var occupantsList = [];
      response.channels[channelName] = {
        occupants: occupantsList,
        name: channelName,
        occupancy: channelEntry.occupancy
      };

      if (includeUUIDs) {
        channelEntry.uuids.forEach(function (uuidEntry) {
          if (includeState) {
            occupantsList.push({ state: uuidEntry.state, uuid: uuidEntry.uuid });
          } else {
            occupantsList.push({ state: null, uuid: uuidEntry });
          }
        });
      }

      return response;
    });

    return response;
  };

  var response = void 0;
  if (channels.length > 1 || channelGroups.length > 0 || channelGroups.length === 0 && channels.length === 0) {
    response = prepareMultipleChannel();
  } else {
    response = prepareSingularChannel();
  }

  return response;
}
//# sourceMappingURL=here_now.js.map
