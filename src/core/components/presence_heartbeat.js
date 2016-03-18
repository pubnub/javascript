/* flow */

import Config from './config';
import State from './state';
import presenceEndpoints from '../endpoints/presence';
import Logger from './logger';

const constants = require('../../../defaults.json');
const logger = Logger.getLogger('component/presenceHeartbeat');


export default class {

  _state: State;
  _config: Config;
  _presence: presenceEndpoints;
  _error: Function;

  _intervalId: number | null;

  constructor(config: Config, state: State, presence: presenceEndpoints) {
    this._state = state;
    this._presence = presence;

    // this._state.onSubscriptionChange(this.__start.bind(this));
  }

  /**
    removes scheduled presence heartbeat executions and executes
    a new presence heartbeat with the new interval
  */
  __start() {
    logger.debug('(re-)starting presence heartbeat');
    this.__start();
    this.__periodicHeartbeat();
  }

  /**
    remove presence heartbeat schedules;
  */
  __stop() {
    logger.debug('stopping presence heartbeat');
    clearTimeout(this._intervalId);
    this._intervalId = null;
  }

  __periodicHeartbeat() {
    const timeoutInterval = this._config.getHeartbeatInterval() * constants.SECOND;

    // if the heartbeat interval is not within the allowed range, exit early
    if (this._config.getHeartbeatInterval() < 1 || this._config.getHeartbeatInterval() > 500) {
      logger.debug('interval is greater than 500 or below 1; aborting');
      return;
    }

    // if there are no active channel / channel groups, bail out.
    if (!this._state.getChannels(true).length && !this._state.getChannelGroups(true).length) {
      logger.debug('there are no channels / channel groups to heartbeat; aborting');
      return;
    }

    this._presence.heartbeat({
      callback() {
        this._intervalId = setTimeout(this._presence_heartbeat, timeoutInterval);
      },
      error(e) {
        if (this._error) {
          this._error('Presence Heartbeat unable to reach Pubnub servers', e);
        }

        this._intervalId = setTimeout(this._presence_heartbeat, timeoutInterval);
      }
    });
  }
}
