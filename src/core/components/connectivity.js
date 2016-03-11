/* @flow */

import EventEmitter from 'event-emitter';

import utils from '../utils';
import Networking from './networking';
import Logger from './logger';

import TimeEndpoint from '../endpoints/time'

const logger = Logger.getLogger('component/Connectivity');

type ConnectivityConstruct = {
  eventEmitter: EventEmitter,
  networking: Networking,
  timeEndpoint: TimeEndpoint
}

export default class {

  _eventEmitter: EventEmitter;
  _networking: Networking;
  _timeEndpoint: TimeEndpoint;

  _timeDrift: number;

  constructor({ eventEmitter, networking, timeEndpoint }: ConnectivityConstruct) {
    this._eventEmitter = eventEmitter;
    this._networking = networking;
    this._timeEndpoint = timeEndpoint;

    /* listen to failed HttpEvents */
    this._eventEmitter.on('unreachableHTTP', this.__onUnreachableHTTP);
  }

  // Detect Age of Message
  detect_latency(tt: number): number {
    var adjusted_time = utils.rnow() - this._timeDrift;
    return adjusted_time - tt / 10000;
  }

  start() {
    this.__detect_time_delta(() => {}, null);
  }

  stop() {

  }

  __onUnreachableHTTP() {
    console.log('HTTP FAILED');
  }

  __poll_online() {
    _is_online() || _reset_offline(1, { error: 'Offline. Please check your network settings.' });
    _poll_timer && clearTimeout(_poll_timer);
    _poll_timer = utils.timeout(_poll_online, constants.SECOND);
  }

  __poll_online2() {
    SELF['time'](function (success) {
      detect_time_detla(function () {}, success);
      success || _reset_offline(1, {
        error: 'Heartbeat failed to connect to Pubnub Servers.' +
        'Please check your network settings.'
      });
      _poll_timer2 && clearTimeout(_poll_timer2);
      _poll_timer2 = utils.timeout(_poll_online2, KEEPALIVE);
    });
  }

  __detect_time_delta(cb: Function, time: number | null) {
    var stime = utils.rnow();

    let calculate = (time) => {
      if (!time) return;
      var ptime = time / 10000;
      var latency = (utils.rnow() - stime) / 2;
      this._timeDrift = utils.rnow() - (ptime + latency);
      if (cb) cb(this._timeDrift);
    };

    if (time) {
      calculate(time);
    } else {
      this._timeEndpoint.fetchTime(calculate);
    }
  }

}

/*
// Test Network Connection
function _test_connection(success) {
  if (success) {
    // Begin Next Socket Connection
    utils.timeout(CONNECT, windowing);
  } else {
    // New Origin on Failed Connection
    networking.shiftStandardOrigin(true);
    networking.shiftSubscribeOrigin(true);

    // Re-test Connection
    utils.timeout(function () {
      SELF['time'](_test_connection);
    }, constants.SECOND);
  }

  // Disconnect & Reconnect
  each_channel(function (channel) {
    // Reconnect
    if (success && channel.disconnected) {
      channel.disconnected = 0;
      return channel.reconnect(channel.name);
    }

    // Disconnect
    if (!success && !channel.disconnected) {
      channel.disconnected = 1;
      channel.disconnect(channel.name);
    }
  });

  // Disconnect & Reconnect for channel groups
  each_channel_group(function (channel_group) {
    // Reconnect
    if (success && channel_group.disconnected) {
      channel_group.disconnected = 0;
      return channel_group.reconnect(channel_group.name);
    }

    // Disconnect
    if (!success && !channel_group.disconnected) {
      channel_group.disconnected = 1;
      channel_group.disconnect(channel_group.name);
    }
  });
}
*/
