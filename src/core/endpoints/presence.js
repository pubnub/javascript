/* @flow */

import Networking from '../components/networking';
import SubscriptionManager from '../components/subscription_manager';
import Config from '../components/config';
import Logger from '../components/logger';
import Responders from '../presenters/responders';
import BaseEndoint from './base.js';
import { endpointDefinition, statusStruct } from '../flow_interfaces';

type presenceConstruct = {
  networking: Networking,
  config: Config,
  subscriptionManager: SubscriptionManager
};

/*
type hereNowArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  uuids: ?boolean,
  state: ?boolean
}
*/

type whereNowArguments = {
  uuid: string,
}

type whereNowResponse = {
  channels: Array<string>,
}

//

type getStateArguments = {
  uuid: string,
  channels: Array<string>,
  channelGroups: Array<string>
}

type getStateResponse = {
  channels: Object
}

//

type setStateArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  state: Object
}

type setStateResponse = {
  state: Object
}

type leaveArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
}

export default class extends BaseEndoint {
  networking: Networking;
  config: Config;
  _r: Responders;
  _l: Logger;

  constructor({ networking, config, subscriptionManager }: presenceConstruct) {
    super({ config });
    this.networking = networking;
    this.config = config;
    this.subscriptionManager = subscriptionManager;
    this._r = new Responders('#endpoints/presence');
    this._l = Logger.getLogger('#endpoints/presence');
  }

  whereNow(args: whereNowArguments, callback: Function) {
    let { uuid = this.config.UUID } = args;
    const endpointConfig: endpointDefinition = {
      params: {
        uuid: { required: false },
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/uuid/' + uuid
    };

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      let response: whereNowResponse = {
        channels: payload.payload.channels
      };

      callback(status, response);
    });
  }

  getState(args: getStateArguments, callback: Function) {
    let { uuid = this.config.UUID, channels = [], channelGroups = [] } = args;
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    const endpointConfig: endpointDefinition = {
      params: {
        uuid: { required: false },
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + stringifiedChannels + '/uuid/' + uuid
    };

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    if (channels.length === 0 && channelGroups.length === 0) {
      return callback(this._r.validationError('Channel or Channel Group must be supplied'));
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (channelGroups.length > 0) {
      params['channel-group'] = channelGroups.join(',');
    }

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      let channelsResponse = {};

      if (channels.length === 1 && channelGroups.length === 0) {
        channelsResponse[channels[0]] = payload.payload;
      } else {
        channelsResponse = payload.payload;
      }

      let response: getStateResponse = {
        channels: channelsResponse
      };

      callback(status, response);
    });
  }

  setState(args: setStateArguments, callback: Function) {
    let { state, channels = [], channelGroups = [] } = args;
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    const endpointConfig: endpointDefinition = {
      params: {
        uuid: { required: false },
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + stringifiedChannels + '/uuid/' + this.config.UUID + '/data'
    };

    if (!callback) {
      return this._l.error('Missing Callback');
    }

    if (channels.length === 0 && channelGroups.length === 0) {
      return callback(this._r.validationError('Channel or Channel Group must be supplied'));
    }

    if (!state) {
      return callback(this._r.validationError('State must be supplied'));
    }

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    params.state = encodeURIComponent(JSON.stringify(state));

    if (channelGroups.length > 0) {
      params['channel-group'] = channelGroups.join(',');
    }

    this.networking.GET(params, endpointConfig, (status: statusStruct, payload: Object) => {
      if (status.error) return callback(status);

      let response: setStateResponse = {
        state: payload.payload
      };

      callback(status, response);
    });
  }

  leave(args: leaveArguments, callback: Function) {
    let { channels = [], channelGroups = [] } = args;
    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
    const endpointConfig: endpointDefinition = {
      params: {
        uuid: { required: false },
        authKey: { required: false }
      },
      url: '/v2/presence/sub-key/' + this.config.subscribeKey + '/channel/' + encodeURIComponent(stringifiedChannels) + '/leave'
    };

    // validate this request and return false if stuff is missing
    if (!this.validateEndpointConfig(endpointConfig)) { return; }

    // create base params
    const params = this.createBaseParams(endpointConfig);

    if (channelGroups.length > 0) {
      params['channel-group'] = encodeURIComponent(channelGroups.join(','));
    }

    this.networking.GET(params, endpointConfig, (status: statusStruct) =>
      callback(status)
    );
  }

  /*
  hereNow(args: hereNowArguments, callback: Function) {
    let { channels = [], channelGroups = [], uuids = true, state } = args;
    let data = {};

    if (!uuids) data.disable_uuids = 1;
    if (state) data.state = 1;

    // Make sure we have a Channel
    if (!callback) {
      return this._l.error('Missing Callback');
    }

    if (channelGroups.length > 0) {
      data['channel-group'] = channelGroups.join(',');
    }

    let stringifiedChannels = channels.length > 0 ? channels.join(',') : null;
    let stringifiedChannelGroups = channelGroups.length > 0 ? channelGroups.join(',') : null;
    this._networking.fetchHereNow(stringifiedChannels, stringifiedChannelGroups, data, callback);
  }

  */

  /*

  */

  /*
  heartbeat(callback: Function) {
    let data: Object = {
      state: JSON.stringify(this._state.getPresenceState()),
      heartbeat: this._state.getPresenceTimeout()
    };

    let channels = this._state.getSubscribedChannels();
    let channelGroups = this._state.getSubscribedChannelGroups();

    if (channelGroups.length > 0) {
      data['channel-group'] = channelGroups.join(',');
    }

    let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';

    this._networking.performHeartbeat(stringifiedChannels, data, callback);
  }
  */

}
