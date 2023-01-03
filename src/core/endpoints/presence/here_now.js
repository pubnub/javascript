/*       */

import { HereNowArguments, ModulesInject, StatusAnnouncement } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNHereNowOperation;
}

export function validateParams(modules) {
  const { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { config } = modules;
  const { channels = [], channelGroups = [] } = incomingParams;
  let baseURL = `/v2/presence/sub-key/${config.subscribeKey}`;

  if (channels.length > 0 || channelGroups.length > 0) {
    const stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    baseURL += `/channel/${utils.encodeString(stringifiedChannels)}`;
  }

  return baseURL;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { channelGroups = [], includeUUIDs = true, includeState = false, queryParameters = {} } = incomingParams;
  let params = {};

  if (!includeUUIDs) params.disable_uuids = 1;
  if (includeState) params.state = 1;

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  params = { ...params, ...queryParameters };

  return params;
}

export function handleResponse(modules, serverResponse, incomingParams) {
  const { channels = [], channelGroups = [], includeUUIDs = true, includeState = false } = incomingParams;

  const prepareSingularChannel = () => {
    const response = {};
    const occupantsList = [];
    response.totalChannels = 1;
    response.totalOccupancy = serverResponse.occupancy;
    response.channels = {};
    response.channels[channels[0]] = {
      occupants: occupantsList,
      name: channels[0],
      occupancy: serverResponse.occupancy,
    };

    // We have had issues in the past with server returning responses
    // that contain no uuids array
    if (includeUUIDs && serverResponse.uuids) {
      serverResponse.uuids.forEach((uuidEntry) => {
        if (includeState) {
          occupantsList.push({ state: uuidEntry.state, uuid: uuidEntry.uuid });
        } else {
          occupantsList.push({ state: null, uuid: uuidEntry });
        }
      });
    }

    return response;
  };

  const prepareMultipleChannel = () => {
    const response = {};
    response.totalChannels = serverResponse.payload.total_channels;
    response.totalOccupancy = serverResponse.payload.total_occupancy;
    response.channels = {};

    Object.keys(serverResponse.payload.channels).forEach((channelName) => {
      const channelEntry = serverResponse.payload.channels[channelName];
      const occupantsList = [];
      response.channels[channelName] = {
        occupants: occupantsList,
        name: channelName,
        occupancy: channelEntry.occupancy,
      };

      if (includeUUIDs) {
        channelEntry.uuids.forEach((uuidEntry) => {
          if (includeState) {
            occupantsList.push({
              state: uuidEntry.state,
              uuid: uuidEntry.uuid,
            });
          } else {
            occupantsList.push({ state: null, uuid: uuidEntry });
          }
        });
      }

      return response;
    });

    return response;
  };

  let response;
  if (channels.length > 1 || channelGroups.length > 0 || (channelGroups.length === 0 && channels.length === 0)) {
    response = prepareMultipleChannel();
  } else {
    response = prepareSingularChannel();
  }

  return response;
}

export function handleError(modules, params, status) {
  if (status.statusCode === 402 && !this.getURL(modules, params).includes('channel')) {
    status.errorData.message =
      'You have tried to perform a Global Here Now operation, ' +
      'your keyset configuration does not support that. Please provide a channel, ' +
      'or enable the Global Here Now feature from the Portal.';
  }
}
