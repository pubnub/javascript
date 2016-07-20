/* @flow */

import { ListChannelsParams, ListChannelsResponse } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNChannelsForGroupOperation';
}

export function validateParams(modules, incomingParams: ListChannelsParams) {
  let { channelGroup } = incomingParams;
  let { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: ListChannelsParams): string {
  let { channelGroup } = incomingParams;
  let { config } = modules;
  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + channelGroup;
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(modules, payload): ListChannelsResponse {
  return {
    channels: payload.payload.channels
  };
}


/*

listChannels(args: ListChannelsParams, callback: Function) {
  let { channelGroup } = args;

  const endpointConfig: EndpointDefinition = {
    params: {
      authKey: { required: false },
      subscribeKey: { required: true }
    },
    url: '/v1/channel-registration/sub-key/' + this.config.subscribeKey + '/channel-group/' + channelGroup,
    operation: 'PNChannelsForGroupOperation'
  };

  if (!channelGroup) return callback(this.createValidationError('Missing Channel Group'));

  // validate this request and return false if stuff is missing
  if (!this.validateEndpointConfig(endpointConfig)) { return; }

  // create base params
  const params = this.createBaseParams(endpointConfig);

  this.networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload: Object) => {
    if (status.error) return callback(status);
    let response: ListChannelsResponse = {
      channels: payload.payload.channels
    };

    callback(status, response);
  });
}

*/
