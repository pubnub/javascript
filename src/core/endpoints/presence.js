/* @flow */

import Networking from '../components/networking';
import Config from '../components/config';
import BaseEndpoint from './base.js';
import { EndpointDefinition, StatusAnnouncement } from '../flow_interfaces';

type PresenceConstruct = {
  networking: Networking,
  config: Config,
};

type HereNowArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  includeUUIDs: boolean,
  includeState: boolean
}

type WhereNowArguments = {
  uuid: string,
}

type WhereNowResponse = {
  channels: Array<string>,
}

//

type GetStateArguments = {
  uuid: string,
  channels: Array<string>,
  channelGroups: Array<string>
}

type GetStateResponse = {
  channels: Object
}

//

type SetStateArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  state: Object
}

type SetStateResponse = {
  state: Object
}

type LeaveArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
}

type HeartbeatArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  state: Object
}

export default class extends BaseEndpoint {
  networking: Networking;
  config: Config;

  constructor({ networking, config }: PresenceConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
  }

  whereNow(args: WhereNowArguments, callback: Function) {
    let { uuid = this.config.UUID } = args;
    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/uuid/' + uuid,
      operation: 'PNWhereNowOperation'
    };

    if (!callback) {
      return this.log('Missing Callback');
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload: Object) => {
      if (status.error) return callback(status);

      let response: WhereNowResponse = {
        channels: payload.payload.channels
      };

      callback(status, response);
    });
  }

  getState(args: GetStateArguments, callback: Function) {
    let { uuid = this.config.UUID, channels = [], channelGroups = [] } = args;
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + stringifiedChannels + '/uuid/' + uuid,
      operation: 'PNGetStateOperation'
    };

    if (!callback) {
      return this.log('Missing Callback');
    }

    if (channels.length === 0 && channelGroups.length === 0) {
      return callback(this.createValidationError('Channel or Channel Group must be supplied'));
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (channelGroups.length > 0) {
      params['channel-group'] = channelGroups.join(',');
    }

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload: Object) => {
      if (status.error) return callback(status);

      let channelsResponse = {};

      if (channels.length === 1 && channelGroups.length === 0) {
        channelsResponse[channels[0]] = payload.payload;
      } else {
        channelsResponse = payload.payload;
      }

      let response: GetStateResponse = {
        channels: channelsResponse
      };

      callback(status, response);
    });
  }

  setState(args: SetStateArguments, callback: Function) {
    let { state, channels = [], channelGroups = [] } = args;
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + stringifiedChannels + '/uuid/' + this.config.UUID + '/data',
      operation: 'PNSetStateOperation'
    };

    if (!callback) {
      return this.log('Missing Callback');
    }

    if (channels.length === 0 && channelGroups.length === 0) {
      return callback(this.createValidationError('Channel or Channel Group must be supplied'));
    }

    if (!state) {
      return callback(this.createValidationError('State must be supplied'));
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    params.state = encodeURIComponent(JSON.stringify(state));

    if (channelGroups.length > 0) {
      params['channel-group'] = channelGroups.join(',');
    }

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload: Object) => {
      if (status.error) return callback(status);

      let response: SetStateResponse = {
        state: payload.payload
      };

      callback(status, response);
    });
  }

  leave(args: LeaveArguments, callback: Function) {
    let { channels = [], channelGroups = [] } = args;
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + encodeURIComponent(stringifiedChannels) + '/leave',
      operation: 'PNUnsubscribeOperation'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (channelGroups.length > 0) {
      params['channel-group'] = encodeURIComponent(channelGroups.join(','));
    }

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement) =>
      callback(status)
    );
  }

  hereNow(args: HereNowArguments, callback: Function) {
    let { channels = [], channelGroups = [], includeUUIDs = true, includeState = false } = args;
    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey,
      operation: 'PNHereNowOperation'
    };

    if (channels.length > 0 || channelGroups.length > 0) {
      let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
      endpointConfig.url += '/channel/' + encodeURIComponent(stringifiedChannels);
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (!includeUUIDs) params.disable_uuids = 1;
    if (includeState) params.state = 1;

    // Make sure we have a Channel
    if (!callback) {
      return this.log('Missing Callback');
    }

    if (channelGroups.length > 0) {
      params['channel-group'] = channelGroups.join(',');
    }

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement, payload) => {
      if (status.error) return callback(status);

      let prepareSingularChannel = () => {
        let response = {};
        let occupantsList = [];
        response.totalChannels = 1;
        response.totalOccupancy = payload.occupancy;
        response.channels = {};
        response.channels[channels[0]] = {
          occupants: occupantsList,
          name: channels[0],
          occupancy: payload.occupancy
        };

        if (includeUUIDs) {
          payload.uuids.forEach((uuidEntry) => {
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
        response.totalChannels = payload.payload.total_channels;
        response.totalOccupancy = payload.payload.total_occupancy;
        response.channels = {};

        Object.keys(payload.payload.channels).forEach((channelName) => {
          let channelEntry = payload.payload.channels[channelName];
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
                occupantsList.push({ state: null, uuid: uuidEntry });
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

      callback(status, response);
    });
  }

  heartbeat(args: HeartbeatArguments, callback: Function) {
    let { channels = [], channelGroups = [], state = {} } = args;
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    const endpointConfig: EndpointDefinition = {
      params: {
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + encodeURIComponent(stringifiedChannels) + '/heartbeat',
      operation: 'PNHeartbeatOperation'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (channelGroups.length > 0) {
      params['channel-group'] = encodeURIComponent(channelGroups.join(','));
    }

    params.state = encodeURIComponent(JSON.stringify(state));
    params.heartbeat = this.config.getPresenceTimeout();

    this.networking.GET(params, endpointConfig, (status: StatusAnnouncement) =>
      callback(status)
    );
  }

}
