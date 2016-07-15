/* @flow */

import BaseEndpoint from './base.js';
import Networking from '../components/networking';
import Config from '../components/config';

import { EndpointDefinition, StatusAnnouncement } from '../flow_interfaces';

type ChannelGroupConstruct = {
  networking: Networking,
  config: Config
};

type ListChannelsParams = {
  channelGroup: string,
}

type DeleteGroupParams = {
  channelGroup: string,
}

type AddChannelParams = {
  channels: Array<string>,
  channelGroup: string,
}

type RemoveChannelParams = {
  channels: Array<string>,
  channelGroup: string,
}


type ListAllGroupsResponse = {
  groups: Array<string>
}

type ListChannelsResponse = {
  channels: Array<string>
}

export default class extends BaseEndpoint {
  networking: Networking;
  config: Config;

  constructor({ networking, config }: ChannelGroupConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
  }

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

  deleteGroup(args: DeleteGroupParams, callback: Function) {
    let { channelGroup } = args;

    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false },
        subscribeKey: { required: true }
      },
      url: '/v1/channel-registration/sub-key/' + this.config.subscribeKey + '/channel-group/' + channelGroup + '/remove',
      operation: 'PNRemoveGroupOperation'
    };

    if (!channelGroup) return callback(this.createValidationError('Missing Channel Group'));

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement) => {
      callback(status);
    });
  }

  listGroups(callback: Function) {
    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false },
        subscribeKey: { required: true }
      },
      url: '/v1/channel-registration/sub-key/' + this.config.subscribeKey + '/channel-group',
      operation: 'PNChannelGroupsOperation'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload: Object) => {
      if (status.error) return callback(status);

      let response: ListAllGroupsResponse = {
        groups: payload.payload.groups
      };

      callback(status, response);
    });
  }

  addChannels(args: AddChannelParams, callback: Function) {
    let { channelGroup, channels = [] } = args;

    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false },
        subscribeKey: { required: true }
      },
      url: '/v1/channel-registration/sub-key/' + this.config.subscribeKey + '/channel-group/' + channelGroup,
      operation: 'PNAddChannelsToGroupOperation'
    };

    if (!channelGroup) return callback(this.createValidationError('Missing Channel Group'));
    if (channels.length === 0) return callback(this.createValidationError('Missing Channel'));

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);
    params.add = channels.join(',');

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement) => {
      callback(status);
    });
  }

  removeChannels(args: RemoveChannelParams, callback: Function) {
    let { channelGroup, channels = [] } = args;

    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false },
        subscribeKey: { required: true }
      },
      url: '/v1/channel-registration/sub-key/' + this.config.subscribeKey + '/channel-group/' + channelGroup,
      operation: 'PNRemoveChannelsFromGroupOperation'
    };

    if (!channelGroup) return callback(this.createValidationError('Missing Channel Group'));
    if (channels.length === 0) return callback(this.createValidationError('Missing Channel'));

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);
    params.remove = channels.join(',');

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement) => {
      callback(status);
    });
  }
}
