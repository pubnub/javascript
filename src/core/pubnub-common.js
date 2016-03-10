/* @flow */

import uuidGenerator from 'uuid';

import Networking from './components/networking';
import Keychain from './components/keychain';
import Config from './components/config';
import State from './components/state';
import PublishQueue from './components/publish_queue';

import Responders from './presenters/responders';

import TimeEndpoint from './endpoints/time';
import PresenceEndpoints from './endpoints/presence';
import HistoryEndpoint from './endpoints/history';
import PushEndpoint from './endpoints/push';
import AccessEndpoints from './endpoints/access';
import ReplyEndpoint from './endpoints/replay';
import ChannelGroupEndpoints from './endpoints/channel_groups';
import PubSubEndpoints from './endpoints/pubsub';

let packageJSON = require('../../package.json');
let defaultConfiguration = require('../../defaults.json');
let utils = require('./utils');

let NOW = 1;
let READY = false;
let READY_BUFFER = [];
let DEF_WINDOWING = 10; // MILLISECONDS.
let DEF_TIMEOUT = 15000; // MILLISECONDS.
let DEF_SUB_TIMEOUT = 310; // SECONDS.
let DEF_KEEPALIVE = 60; // SECONDS (FOR TIMESYNC).
let SECOND = 1000; // A THOUSAND MILLISECONDS.

let SDK_VER = packageJSON.version;

/**
 * UTILITIES
 */
function unique(): string {
  return 'x' + ++NOW + '' + (+new Date);
}


// PUBNUB READY TO CONNECT
function ready() {
  if (READY) return;
  READY = 1;
  utils.each(READY_BUFFER, function (connect) {
    connect();
  });
}

function PNmessage(args) {
  let msg = args || { apns: {} };

  msg['getPubnubMessage'] = function () {
    var m: Object = {};

    if (Object.keys(msg['apns']).length) {
      m['pn_apns'] = {
        aps: {
          alert: msg['apns']['alert'],
          badge: msg['apns']['badge']
        }
      };
      for (var k in msg['apns']) {
        m['pn_apns'][k] = msg['apns'][k];
      }
      var exclude1 = ['badge', 'alert'];
      for (var k in exclude1) {
        delete m['pn_apns'][exclude1[k]];
      }
    }

    if (msg['gcm']) {
      m['pn_gcm'] = {
        data: msg['gcm']
      };
    }

    for (var k in msg) {
      m[k] = msg[k];
    }
    var exclude = ['apns', 'gcm', 'publish', 'channel', 'callback', 'error'];
    for (var k in exclude) {
      delete m[exclude[k]];
    }

    return m;
  };
  msg['publish'] = function () {
    var m = msg.getPubnubMessage();

    if (msg['pubnub'] && msg['channel']) {
      msg['pubnub'].publish({
        message: m,
        channel: msg['channel'],
        callback: msg['callback'],
        error: msg['error']
      });
    }
  };
  return msg;
}

type setupObject = {
  use_send_beacon: ?boolean, // configuration on beacon usage
  sendBeacon: ?Function, // executes a call against the Beacon API
  publish_key: ?string, // API key required for publishing
  subscribe_key: string, // API key required to subscribe
  cipher_key: string, // decryption keys
  origin: ?string, // an optional FQDN which will recieve calls from the SDK.
  xdr: Function, // function which executes HTTP calls
  hmac_SHA256: Function // hashing function required for Access Manager
}

function PN_API(setup: setupObject) {
  let useSendBeacon = (typeof setup.use_send_beacon !== 'undefined') ? setup.use_send_beacon : true;
  let sendBeacon = (useSendBeacon) ? setup.sendBeacon : null;
  let { xdr } = setup;
  let db = setup.db || { get: function () {}, set: function () {} };
  let error = setup.error || function () {};
  let hmac_SHA256 = setup.hmac_SHA256;
  let crypto_obj = setup.crypto_obj || {
    encrypt(a) { return a; },
    decrypt(b) { return b; },
  };

  let keychain = new Keychain()
    .setInstanceId(uuidGenerator.v4())
    .setAuthKey(setup.auth_key || '')
    .setSecretKey(setup.secret_key || '')
    .setSubscribeKey(setup.subscribe_key)
    .setPublishKey(setup.publish_key)
    .setCipherKey(setup.cipher_key);

  keychain.setUUID(
    setup.uuid ||
    (!setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || uuidGenerator.v4())
  );

  // write the new key to storage
  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

  let config = new Config()
    .setRequestIdConfig(setup.use_request_id || false)
    .setPresenceTimeout(utils.validateHeartbeat(setup.heartbeat || setup.pnexpires || 0, error))
    .setSupressLeaveEvents(setup.noleave || 0)
    .setInstanceIdConfig(setup.instance_id || false);

  config
    .setHeartbeatInterval(setup.heartbeat_interval || (config.getPresenceTimeout() / 2) - 1);

  let stateStorage = new State();

  let networking = new Networking(setup.xdr, keychain, setup.ssl, setup.origin)
    .addBeaconDispatcher(sendBeacon)
    .setCoreParams(setup.params || {});

  let publishQueue = new PublishQueue({ networking });

  // initialize the encryption and decryption logic
  function encrypt(input, key) {
    return crypto_obj.encrypt(input, key || keychain.getCipherKey()) || input;
  }

  function decrypt(input, key) {
    return crypto_obj['decrypt'](input, key || keychain.getCipherKey()) ||
      crypto_obj['decrypt'](input, keychain.getCipherKey()) ||
      input;
  }

  // initalize the endpoints
  let timeEndpoint = new TimeEndpoint({ keychain, config, networking });
  let pushEndpoint = new PushEndpoint({ keychain, config, networking, error });
  let presenceEndpoints = new PresenceEndpoints({ keychain, config, networking, error, state: stateStorage });
  let historyEndpoint = new HistoryEndpoint({ keychain, networking, error, decrypt });
  let accessEndpoints = new AccessEndpoints({ keychain, config, networking, error, hmac_SHA256 });
  let replayEndpoint = new ReplyEndpoint({ keychain, networking, error });
  let channelGroupEndpoints = new ChannelGroupEndpoints({ keychain, networking, config, error });
  let pubsubEndpoints = new PubSubEndpoints({ keychain, networking, presenceEndpoints, error, config, publishQueue, state: stateStorage });

  let SUB_WINDOWING = +setup['windowing'] || DEF_WINDOWING;
  let SUB_TIMEOUT = (+setup['timeout'] || DEF_SUB_TIMEOUT) * SECOND;
  let KEEPALIVE = (+setup['keepalive'] || DEF_KEEPALIVE) * SECOND;
  let TIME_CHECK = setup['timecheck'] || 0;
  let CONNECT = function () {
  };
  let PUB_QUEUE = [];
  let TIME_DRIFT = 0;
  let SUB_CALLBACK = 0;
  let SUB_CHANNEL = 0;
  let SUB_RECEIVER = 0;
  let SUB_RESTORE = setup['restore'] || 0;
  let TIMETOKEN = 0;
  let RESUMED = false;
  let SUB_ERROR = function () {
  };
  let PRESENCE_HB_TIMEOUT = null;
  let PRESENCE_HB_RUNNING = false;
  let NO_WAIT_FOR_PENDING = setup['no_wait_for_pending'];
  let _is_online = setup['_is_online'] || function () { return 1;};
  let shutdown = setup['shutdown'];
  let _poll_timer;
  let _poll_timer2;

  if (config.getPresenceTimeout() === 2) {
    config.setHeartbeatInterval(1);
  }

  function _presence_heartbeat() {
    clearTimeout(PRESENCE_HB_TIMEOUT);

    if (!config.getHeartbeatInterval() || config.getHeartbeatInterval() >= 500 ||
      config.getHeartbeatInterval() < 1 ||
      (!stateStorage.generate_channel_list(true).length && !stateStorage.generate_channel_group_list(true).length)) {
      PRESENCE_HB_RUNNING = false;
      return;
    }

    PRESENCE_HB_RUNNING = true;
    SELF['presence_heartbeat']({
      callback: function (r) {
        PRESENCE_HB_TIMEOUT = utils.timeout(_presence_heartbeat, (config.getHeartbeatInterval()) * SECOND);
      },
      error: function (e) {
        error && error('Presence Heartbeat unable to reach Pubnub servers.' + JSON.stringify(e));
        PRESENCE_HB_TIMEOUT = utils.timeout(_presence_heartbeat, (config.getHeartbeatInterval()) * SECOND);
      }
    });
  }

  function start_presence_heartbeat() {
    !PRESENCE_HB_RUNNING && _presence_heartbeat();
  }

  function each_channel_group(callback) {
    var count = 0;

    utils.each(stateStorage.generate_channel_group_list(), function (channel_group) {
      var chang = stateStorage.getChannelGroup(channel_group);

      if (!chang) return;

      count++;
      (callback || function () {
      })(chang);
    });

    return count;
  }

  function each_channel(callback) {
    var count = 0;

    utils.each(stateStorage.generate_channel_list(), function (channel) {
      var chan = stateStorage.getChannel(channel);

      if (!chan) return;

      count++;
      (callback || function () {
      })(chan);
    });

    return count;
  }

  // Announce Leave Event
  let SELF = {
    history(args: Object, callback: Function) { historyEndpoint.fetchHistory(args, callback); },

    time(callback: Function) { timeEndpoint.fetchTime(callback); },

    here_now(args: Object, callback: Function) { presenceEndpoints.hereNow(args, callback); },
    where_now(args: Object, callback: Function) { presenceEndpoints.whereNow(args, callback); },
    presence_heartbeat(args: Object) { presenceEndpoints.heartbeat(args); },
    state(args:Object, callback: Function) { presenceEndpoints.performState(args, callback); },

    grant(args: Object, callback: Function) { accessEndpoints.performGrant(args, callback); },
    audit(args: Object, callback: Function) { accessEndpoints.performAudit(args, callback); },

    mobile_gw_provision(args: Object) { pushEndpoint.provisionDevice(args); },

    replay(args: Object, callback: Function) { replayEndpoint.performReplay(args, callback); },

    // channel groups related
    channel_group(args: Object, callback: Function) {
      channelGroupEndpoints.channelGroup(args, callback);
    },
    channel_group_list_groups(args: Object, callback: Function) {
      channelGroupEndpoints.listGroups(args, callback);
    },
    channel_group_remove_group(args: Object, callback: Function) {
      channelGroupEndpoints.removeGroup(args, callback);
    },
    channel_group_list_channels(args: Object, callback: Function) {
      channelGroupEndpoints.listChannels(args, callback);
    },
    channel_group_add_channel(args: Object, callback: Function) {
      channelGroupEndpoints.addChannel(args, callback);
    },
    channel_group_remove_channel(args: Object, callback: Function) {
      channelGroupEndpoints.removeChannel(args, callback);
    },

    set_resumed: function (resumed) {
      RESUMED = resumed;
    },

    get_cipher_key: function () {
      return keychain.getCipherKey();
    },

    set_cipher_key: function (key) {
      keychain.setCipherKey(key);
    },

    raw_encrypt: function (input, key) {
      return encrypt(input, key);
    },

    raw_decrypt: function (input, key) {
      return decrypt(input, key);
    },

    get_heartbeat: function () {
      return config.getPresenceTimeout();
    },

    set_heartbeat: function (heartbeat, heartbeat_interval) {
      config.setPresenceTimeout(utils.validateHeartbeat(heartbeat, config.getPresenceTimeout(), error));
      config.setHeartbeatInterval(heartbeat_interval || (config.getPresenceTimeout() / 2) - 1);
      if (config.getPresenceTimeout() === 2) {
        config.setHeartbeatInterval(1);
      }
      CONNECT();
      _presence_heartbeat();
    },

    get_heartbeat_interval: function () {
      return config.getHeartbeatInterval();
    },

    set_heartbeat_interval: function (heartbeat_interval) {
      config.setHeartbeatInterval(heartbeat_interval);
      _presence_heartbeat();
    },

    get_version: function () {
      return SDK_VER;
    },

    getGcmMessageObject: function (obj) {
      return {
        data: obj,
      };
    },

    getApnsMessageObject: function (obj) {
      var x = {
        aps: { badge: 1, alert: '' }
      };
      for (var k in obj) {
        k[x] = obj[k];
      }
      return x;
    },

    _add_param: function (key, val) {
      networking.addCoreParam(key, val);
    },

    /*
     PUBNUB.auth('AJFLKAJSDKLA');
     */
    auth: function (auth) {
      keychain.setAuthKey(auth);
      CONNECT();
    },

    publish(args: Object, callback: Function) {
      pubsubEndpoints.performPublish(args, callback);
    },


    unsubscribe(args: Object, callback: Function) {
      TIMETOKEN = 0;
      SUB_RESTORE = 1;   // REVISIT !!!!

      pubsubEndpoints.performUnsubscribe(args, callback);

      CONNECT();
    },

    /*
     PUBNUB.subscribe({
     channel  : 'my_chat'
     callback : function(message) { }
     });
     */
    subscribe: function (args, callback) {
      var channel = args['channel'];
      var channel_group = args['channel_group'];
      var callback = callback || args['callback'];
      var callback = callback || args['message'];
      var connect = args['connect'] || function () {};
      var reconnect = args['reconnect'] || function () {};
      var disconnect = args['disconnect'] || function () {};
      var SUB_ERROR = args['error'] || SUB_ERROR || function () {};
      var idlecb = args['idle'] || function () {};
      var presence = args['presence'] || 0;
      var backfill = args['backfill'] || 0;
      var timetoken = args['timetoken'] || 0;
      var sub_timeout = args['timeout'] || SUB_TIMEOUT;
      var windowing = args['windowing'] || SUB_WINDOWING;
      var state = args['state'];
      var heartbeat = args['heartbeat'] || args['pnexpires'];
      var heartbeat_interval = args['heartbeat_interval'];
      var restore = args['restore'] || SUB_RESTORE;

      keychain.setAuthKey(args['auth_key'] || keychain.getAuthKey());

      // Restore Enabled?
      SUB_RESTORE = restore;

      // Always Reset the TT
      TIMETOKEN = timetoken;

      // Make sure we have a Channel
      if (!channel && !channel_group) {
        return error('Missing Channel');
      }

      if (!callback) return error('Missing Callback');
      if (!keychain.getSubscribeKey()) return error('Missing Subscribe Key');

      if (heartbeat || heartbeat === 0 || heartbeat_interval || heartbeat_interval === 0) {
        SELF['set_heartbeat'](heartbeat, heartbeat_interval);
      }

      // Setup Channel(s)
      if (channel) {
        utils.each((channel.join ? channel.join(',') : '' + channel).split(','),
          function (channel) {
            var settings = stateStorage.getChannel(channel) || {};

            // Store Channel State
            stateStorage.addChannel(SUB_CHANNEL = channel, {
              name: channel,
              connected: settings.connected,
              disconnected: settings.disconnected,
              subscribed: 1,
              callback: SUB_CALLBACK = callback,
              cipher_key: args['cipher_key'],
              connect: connect,
              disconnect: disconnect,
              reconnect: reconnect,
            });

            if (state) {
              if (channel in state) {
                stateStorage.addToPresenceState(channel, state[channel]);
              } else {
                stateStorage.addToPresenceState(channel, state);
              }
            }

            // Presence Enabled?
            if (!presence) return;

            // Subscribe Presence Channel
            SELF['subscribe']({
              channel: channel + defaultConfiguration.PRESENCE_SUFFIX,
              callback: presence,
              restore: restore,
            });

            // Presence Subscribed?
            if (settings.subscribed) return;
          });
      }

      // Setup Channel Groups
      if (channel_group) {
        utils.each((channel_group.join ? channel_group.join(',') : '' + channel_group).split(','),
          function (channel_group) {
            var settings = stateStorage.getChannelGroup(channel_group) || {};

            stateStorage.addChannelGroup(channel_group, {
              name: channel_group,
              connected: settings.connected,
              disconnected: settings.disconnected,
              subscribed: 1,
              callback: SUB_CALLBACK = callback,
              cipher_key: args['cipher_key'],
              connect: connect,
              disconnect: disconnect,
              reconnect: reconnect,
            });

            // Presence Enabled?
            if (!presence) return;

            // Subscribe Presence Channel
            SELF['subscribe']({
              channel_group: channel_group + defaultConfiguration.PRESENCE_SUFFIX,
              callback: presence,
              restore: restore,
              auth_key: keychain.getAuthKey(),
            });

            // Presence Subscribed?
            if (settings.subscribed) return;
          });
      }


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
          }, SECOND);
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

      // Evented Subscribe
      function _connect() {
        let channels = stateStorage.generate_channel_list().join(',');
        let channel_groups = stateStorage.generate_channel_group_list().join(',');

        // Stop Connection
        if (!channels && !channel_groups) return;

        if (!channels) channels = ',';

        // Connect to PubNub Subscribe Servers
        _reset_offline();

        let data = networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() });

        if (channel_groups) {
          data['channel-group'] = channel_groups;
        }


        let st = JSON.stringify(stateStorage.getPresenceState());
        if (st.length > 2) data['state'] = JSON.stringify(stateStorage.getPresenceState());

        if (config.getPresenceTimeout()) {
          data['heartbeat'] = config.getPresenceTimeout();
        }

        if (config.isInstanceIdEnabled()) {
          data['instanceid'] = keychain.getInstanceId();
        }

        start_presence_heartbeat();
        SUB_RECEIVER = xdr({
          timeout: sub_timeout,
          fail: function (response) {
            if (response && response['error'] && response['service']) {
              Responders.error(response, SUB_ERROR);
              _test_connection(false);
            } else {
              SELF['time'](function (success) {
                !success && (Responders.error(response, SUB_ERROR));
                _test_connection(success);
              });
            }
          },
          data: networking.prepareParams(data),
          url: [
            networking.getSubscribeOrigin(), 'subscribe',
            keychain.getSubscribeKey(), utils.encode(channels),
            0, TIMETOKEN
          ],
          success: function (messages) {
            // Check for Errors
            if (!messages || (typeof messages == 'object' && 'error' in messages && messages['error'])) {
              SUB_ERROR(messages);
              return utils.timeout(CONNECT, SECOND);
            }

            // User Idle Callback
            idlecb(messages[1]);

            // Restore Previous Connection Point if Needed
            TIMETOKEN = !TIMETOKEN && SUB_RESTORE && db['get'](keychain.getSubscribeKey()) || messages[1];

            /*
             // Connect
             each_channel_registry(function(registry){
             if (registry.connected) return;
             registry.connected = 1;
             registry.connect(channel.name);
             });
             */

            // Connect
            each_channel(function (channel) {
              if (channel.connected) return;
              channel.connected = 1;
              channel.connect(channel.name);
            });

            // Connect for channel groups
            each_channel_group(function (channel_group) {
              if (channel_group.connected) return;
              channel_group.connected = 1;
              channel_group.connect(channel_group.name);
            });

            if (RESUMED && !SUB_RESTORE) {
              TIMETOKEN = 0;
              RESUMED = false;
              // Update Saved Timetoken
              db['set'](keychain.getSubscribeKey(), 0);
              utils.timeout(_connect, windowing);
              return;
            }

            // Invoke Memory Catchup and Receive Up to 100
            // Previous Messages from the Queue.
            if (backfill) {
              TIMETOKEN = 10000;
              backfill = 0;
            }

            // Update Saved Timetoken
            db['set'](keychain.getSubscribeKey(), messages[1]);

            // Route Channel <---> Callback for Message
            var next_callback = (function () {
              var channels = '';
              var channels2 = '';

              if (messages.length > 3) {
                channels = messages[3];
                channels2 = messages[2];
              } else if (messages.length > 2) {
                channels = messages[2];
              } else {
                channels = utils.map(
                  stateStorage.generate_channel_list(), function (chan) {
                    return utils.map(
                      Array(messages[0].length)
                        .join(',').split(','),
                      function () {
                        return chan;
                      }
                    );
                  }).join(',');
              }

              var list = channels.split(',');
              var list2 = (channels2) ? channels2.split(',') : [];

              return function () {
                var channel = list.shift() || SUB_CHANNEL;
                var channel2 = list2.shift();

                var chobj = {};

                if (channel2) {
                  if (channel && channel.indexOf('-pnpres') >= 0
                    && channel2.indexOf('-pnpres') < 0) {
                    channel2 += '-pnpres';
                  }
                  chobj = stateStorage.getChannelGroup(channel2) || stateStorage.getChannel(channel2) || { callback: function () {} };
                } else {
                  chobj = stateStorage.getChannel(channel);
                }

                var r = [
                  chobj
                    .callback || SUB_CALLBACK,
                  channel.split(defaultConfiguration.PRESENCE_SUFFIX)[0],
                ];
                channel2 && r.push(channel2.split(defaultConfiguration.PRESENCE_SUFFIX)[0]);
                return r;
              };
            })();

            var latency = detect_latency(+messages[1]);
            utils.each(messages[0], function (msg) {
              var next = next_callback();
              var decrypted_msg = decrypt(msg,
                (stateStorage.getChannel(next[1])) ? stateStorage.getChannel(next[1])['cipher_key'] : null);
              next[0] && next[0](decrypted_msg, messages, next[2] || next[1], latency, next[1]);
            });

            utils.timeout(_connect, windowing);
          },
        });
      }

      CONNECT = function () {
        _reset_offline();
        utils.timeout(_connect, windowing);
      };

      // Reduce Status Flicker
      if (!READY) return READY_BUFFER.push(CONNECT);

      // Connect Now
      CONNECT();
    },

    /*
     PUBNUB.revoke({
     channel  : 'my_chat',
     callback : fun,
     error    : fun,
     auth_key : '3y8uiajdklytowsj'
     });
     */
    revoke: function (args, callback) {
      args['read'] = false;
      args['write'] = false;
      SELF['grant'](args, callback);
    },

    set_uuid: function (uuid) {
      keychain.setUUID(uuid);
      CONNECT();
    },

    get_uuid: function () {
      return keychain.getUUID();
    },

    isArray: function (arg) {
      return utils.isArray(arg);
    },

    get_subscribed_channels: function () {
      return stateStorage.generate_channel_list(true);
    },

    stop_timers: function () {
      clearTimeout(_poll_timer);
      clearTimeout(_poll_timer2);
      clearTimeout(PRESENCE_HB_TIMEOUT);
    },

    shutdown: function () {
      SELF['stop_timers']();
      shutdown && shutdown();
    },

    // Expose PUBNUB Functions
    xdr: xdr,
    ready: ready,
    db: db,
    uuid: utils.generateUUID,
    map: utils.map,
    each: utils.each,
    'each-channel': each_channel,
    grep: utils.grep,
    offline: function () {
      _reset_offline(1, { message: 'Offline. Please check your network settings.' });
    },
    supplant: utils.supplant,
    now: utils.rnow,
    unique: unique,
    updater: utils.updater
  };

  function _poll_online() {
    _is_online() || _reset_offline(1, { error: 'Offline. Please check your network settings.' });
    _poll_timer && clearTimeout(_poll_timer);
    _poll_timer = utils.timeout(_poll_online, SECOND);
  }

  function _poll_online2() {
    if (!TIME_CHECK) return;
    SELF['time'](function (success) {
      detect_time_detla(function () {
      }, success);
      success || _reset_offline(1, {
        error: 'Heartbeat failed to connect to Pubnub Servers.' +
        'Please check your network settings.'
      });
      _poll_timer2 && clearTimeout(_poll_timer2);
      _poll_timer2 = utils.timeout(_poll_online2, KEEPALIVE);
    });
  }

  function _reset_offline(err, msg) {
    SUB_RECEIVER && SUB_RECEIVER(err, msg);
    SUB_RECEIVER = null;

    clearTimeout(_poll_timer);
    clearTimeout(_poll_timer2);
  }

  _poll_timer = utils.timeout(_poll_online, SECOND);
  _poll_timer2 = utils.timeout(_poll_online2, KEEPALIVE);
  PRESENCE_HB_TIMEOUT = utils.timeout(start_presence_heartbeat, (config.getHeartbeatInterval() - 3) * SECOND);

  // Detect Age of Message
  function detect_latency(tt) {
    var adjusted_time = utils.rnow() - TIME_DRIFT;
    return adjusted_time - tt / 10000;
  }

  detect_time_detla();
  function detect_time_detla(cb, time) {
    var stime = utils.rnow();

    time && calculate(time) || SELF['time'](calculate);

    function calculate(time) {
      if (!time) return;
      var ptime = time / 10000;
      var latency = (utils.rnow() - stime) / 2;
      TIME_DRIFT = utils.rnow() - (ptime + latency);
      cb && cb(TIME_DRIFT);
    }
  }

  return SELF;
}

module.exports = {
  PN_API: PN_API,
  unique: unique,
  PNmessage: PNmessage,
  DEF_TIMEOUT: DEF_TIMEOUT,
  timeout: utils.timeout,
  build_url: utils.buildURL,
  each: utils.each,
  uuid: utils.generateUUID,
  URLBIT: defaultConfiguration.URLBIT,
  grep: utils.grep,
  supplant: utils.supplant,
  now: utils.rnow,
  updater: utils.updater,
  map: utils.map,
};
