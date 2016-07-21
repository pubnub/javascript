/* @flow */

import { HereNowArguments } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNHereNowOperation';
}

export function validateParams(modules) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: HereNowArguments): string {
  let { config } = modules;
  let { channels = [], channelGroups = [] } = incomingParams;
  let baseURL = '/v2/presence/sub-key/' + config.subscribeKey;

  if (channels.length > 0 || channelGroups.length > 0) {
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    baseURL += '/channel/' + encodeURIComponent(stringifiedChannels);
  }

  return baseURL;
}

export function prepareParams(modules, incomingParams: HereNowArguments): Object {
  let { channelGroups = [], includeUUIDs = true, includeState = false } = incomingParams;
  const params = {};

  if (!includeUUIDs) params.disable_uuids = 1;
  if (includeState) params.state = 1;

  if (channelGroups.length > 0) {
    params['channel-group'] = encodeURIComponent(channelGroups.join(','));
  }

  return params;
}

export function handleResponse(modules, serverResponse: Object, incomingParams: HereNowArguments): Object {
  let { channels = [], channelGroups = [], includeUUIDs = true, includeState = false } = incomingParams;

  let prepareSingularChannel = () => {
    let response = {};
    let occupantsList = [];
    response.totalChannels = 1;
    response.totalOccupancy = serverResponse.occupancy;
    response.channels = {};
    response.channels[channels[0]] = {
      occupants: occupantsList,
      name: channels[0],
      occupancy: serverResponse.occupancy
    };

    if (includeUUIDs) {
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

  let prepareMultipleChannel = () => {
    let response = {};
    response.totalChannels = serverResponse.payload.total_channels;
    response.totalOccupancy = serverResponse.payload.total_occupancy;
    response.channels = {};

    Object.keys(serverResponse.payload.channels).forEach((channelName) => {
      let channelEntry = serverResponse.payload.channels[channelName];
      let occupantsList = [];
      response.channels[channelName] = {
        occupants: occupantsList,
        name: channelName,
        occupancy: channelEntry.occupancy
      };

      if (includeUUIDs) {
        channelEntry.uuids.forEach((uuidEntry) => {
          if (includeState) {
            occupantsList.push({ state: uuidEntry.state, uuid: uuidEntry.uuid });
          } else {
            occupantsList.push({ state: null, uuid: uuidEntry.uuid });
          }
        });
      }

      return response;
    });

    return response;
  };

  let response;
  if (channels.length > 1 || channelGroups.length > 0) {
    response = prepareMultipleChannel();
  } else {
    response = prepareSingularChannel();
  }

  return response;
}
