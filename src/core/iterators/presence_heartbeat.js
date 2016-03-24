/* flow */

import State from '../components/state';
import presenceEndpoints from '../endpoints/presence';
import Logger from '../components/logger';
import { callbackStruct } from '../flow_interfaces';

const constants = require('../../../defaults.json');

type hearbeatConstructor = {
  state: State,
  presence: presenceEndpoints,
  callbacks: callbackStruct
}

export default class {

  _state: State;
  _presence: presenceEndpoints;
  _callbacks: callbackStruct;

  _intervalId: number | null;

  _l: Logger;


  constructor({ state, presence, callbacks }: hearbeatConstructor) {
    this._state = state;
    this._presence = presence;
    this._callbacks = callbacks;

    this._state.onPresenceConfigChange(this.start.bind(this));
    this._state.onSubscriptionChange(this.start.bind(this));
    this._state.onStateChange(this.start.bind(this));

    this._l = Logger.getLogger('#iterators/presence_heartbeat');
  }

  /**
    removes scheduled presence heartbeat executions and executes
    a new presence heartbeat with the new interval
  */
  start() {
    this._l.debug('(re-)starting presence heartbeat');
    this.stop();
    this.__periodicHeartbeat();
  }

  /**
    remove presence heartbeat schedules;
  */
  stop() {
    this._l.debug('stopping presence heartbeat');
    clearTimeout(this._intervalId);
    this._intervalId = null;
  }

  __periodicHeartbeat() {
    let { onStatus } = this._callbacks;
    const timeoutInterval = this._state.getPresenceAnnounceInterval() * constants.SECOND;

    // if the heartbeat interval is not within the allowed range, exit early
    if (this._state.getPresenceAnnounceInterval() < 1 || this._state.getPresenceAnnounceInterval() > 500) {
      this._l.debug('interval is greater than 500 or below 1; aborting');
      return;
    }

    // if there are no active channel / channel groups, bail out.
    if (this._state.getChannelsWithPresence().length === 0 && this._state.getChannelGroupsWithPresence().length === 0) {
      this._l.debug('there are no channels / channel groups to heartbeat; aborting');
      return;
    }

    this._presence.heartbeat((err) => {
      this._intervalId = setTimeout(this.__periodicHeartbeat, timeoutInterval);

      if (err) {
        onStatus({
          type: 'heartbeatFailure',
          message: 'Presence Heartbeat unable to reach Pubnub servers',
          rawError: err
        });
      }
    });
  }
}
