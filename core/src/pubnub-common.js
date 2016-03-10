/* @flow */

import uuidGenerator from 'uuid';

import Networking from './components/networking';
import Keychain from './components/keychain';
import Config from './components/config';
import State from './components/state';

import Responders from './presenters/responders';

import TimeEndpoint from './endpoints/time';
import PresenceEndpoints from './endpoints/presence';
import HistoryEndpoint from './endpoints/history';
import PushEndpoint from './endpoints/push';
import AccessEndpoints from './endpoints/access';
import ReplyEndpoint from './endpoints/replay';
import ChannelGroupEndpoints from './endpoints/channel_groups';

let packageJSON = require('../../package.json');
let defaultConfiguration = require('../defaults.json');
let utils = require('./utils');

let NOW = 1;
let READY = false;
let READY_BUFFER = [];
let PRESENCE_SUFFIX = '-pnpres';
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
  var msg = args || { apns: {} };

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

function PN_API(setup) {
  let jsonp_cb = setup.jsonp_cb || function () { return 0; };
  let { xdr } = setup;
  let db = setup.db || { get: function () {}, set: function () {} };
  let error = setup.error || function () {};
  let hmac_SHA256 = setup.hmac_SHA256;
  let crypto_obj = setup.crypto_obj || {
    encrypt(a, key) { return a; },
    decrypt(b, key) { return b; }
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
    .setInstanceIdConfig(setup.instance_id || false);

  config
    .setHeartbeatInterval(setup.heartbeat_interval || (config.getPresenceTimeout() / 2) - 1);

  let stateStorage = new State();

  let networking = new Networking(setup.xdr, keychain, setup.ssl, setup.origin)
    .setCoreParams(setup.params || {});

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
  let timeEndpoint = new TimeEndpoint({ keychain, config, networking, jsonp_cb });
  let pushEndpoint = new PushEndpoint({ keychain, config, networking, jsonp_cb, error });
  let presenceEndpoints = new PresenceEndpoints({ keychain, config, networking, jsonp_cb, error });
  let historyEndpoint = new HistoryEndpoint({ keychain, networking, jsonp_cb, error, decrypt });
  let accessEndpoints = new AccessEndpoints({ keychain, config, networking, jsonp_cb, error, hmac_SHA256 });
  let replayEndpoint = new ReplyEndpoint({ keychain, networking, jsonp_cb, error });
  let channelGroupEndpoints = new ChannelGroupEndpoints({ keychain, networking, config, jsonp_cb, error });

  var SUB_WINDOWING = +setup['windowing'] || DEF_WINDOWING;
  var SUB_TIMEOUT = (+setup['timeout'] || DEF_SUB_TIMEOUT) * SECOND;
  var KEEPALIVE = (+setup['keepalive'] || DEF_KEEPALIVE) * SECOND;
  var TIME_CHECK = setup['timecheck'] || 0;
  var NOLEAVE = setup['noleave'] || 0;
  var SSL = setup['ssl'] ? 's' : '';
  var CONNECT = function () {
  };
  var PUB_QUEUE = [];
  var TIME_DRIFT = 0;
  var SUB_CALLBACK = 0;
  var SUB_CHANNEL = 0;
  var SUB_RECEIVER = 0;
  var SUB_RESTORE = setup['restore'] || 0;
  var SUB_BUFF_WAIT = 0;
  var TIMETOKEN = 0;
  var RESUMED = false;
  var SUB_ERROR = function () {
  };
  var PRESENCE_HB_TIMEOUT = null;
  var PRESENCE_HB_RUNNING = false;
  var NO_WAIT_FOR_PENDING = setup['no_wait_for_pending'];
  var COMPATIBLE_35 = setup['compatible_3.5'] || false;
  var _is_online = setup['_is_online'] || function () { return 1;};
  var shutdown = setup['shutdown'];
  var use_send_beacon = (typeof setup['use_send_beacon'] != 'undefined') ? setup['use_send_beacon'] : true;
  var sendBeacon = (use_send_beacon) ? setup['sendBeacon'] : null;
  var _poll_timer;
  var _poll_timer2;

  if (config.getPresenceTimeout() === 2) config.setHeartbeatInterval(1);


  function error_common(message, callback) {
    callback && callback({ error: message || 'error occurred' });
    error && error(message);
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

  function publish(next) {
    if (NO_WAIT_FOR_PENDING) {
      if (!PUB_QUEUE.length) return;
    } else {
      if (next) PUB_QUEUE.sending = 0;
      if (PUB_QUEUE.sending || !PUB_QUEUE.length) return;
      PUB_QUEUE.sending = 1;
    }

    xdr(PUB_QUEUE.shift());
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
  var SELF = {
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

    LEAVE: function (channel, blocking, auth_key, callback, error) {
      var data: Object = { uuid: keychain.getUUID(), auth: auth_key || keychain.getAuthKey() };
      var origin = networking.nextOrigin(false);
      var callback = callback || function () {};
      var err = error || function () {};
      var url;
      var params;
      var jsonp = jsonp_cb();

      // Prevent Leaving a Presence Channel
      if (channel.indexOf(PRESENCE_SUFFIX) > 0) return true;


      if (COMPATIBLE_35) {
        if (!SSL) return false;
        if (jsonp == '0') return false;
      }

      if (NOLEAVE) return false;

      if (jsonp != '0') data['callback'] = jsonp;

      if (config.isInstanceIdEnabled()) {
        data['instanceid'] = keychain.getInstanceId();
      }

      url = [
        origin, 'v2', 'presence', 'sub_key',
        keychain.getSubscribeKey(), 'channel', utils.encode(channel), 'leave'
      ];

      params = networking.prepareParams(data);


      if (sendBeacon) {
        var url_string = utils.buildURL(url, params);
        if (sendBeacon(url_string)) {
          callback && callback({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
          return true;
        }
      }


      xdr({
        blocking: blocking || SSL,
        callback: jsonp,
        data: params,
        success: function (response) {
          Responders.callback(response, callback, err);
        },
        fail: function (response) {
          Responders.error(response, err);
        },
        url: url
      });
      return true;
    },

    LEAVE_GROUP: function (channel_group, blocking, auth_key, callback, error) {
      var data: Object = { uuid: keychain.getUUID(), auth: auth_key || keychain.getAuthKey() };
      var origin = networking.nextOrigin(false);
      var url;
      var params;
      var callback = callback || function () {};
      var err = error || function () {};
      var jsonp = jsonp_cb();

      // Prevent Leaving a Presence Channel Group
      if (channel_group.indexOf(PRESENCE_SUFFIX) > 0) return true;

      if (COMPATIBLE_35) {
        if (!SSL) return false;
        if (jsonp == '0') return false;
      }

      if (NOLEAVE) return false;

      if (jsonp != '0') data['callback'] = jsonp;

      if (channel_group && channel_group.length > 0) data['channel-group'] = channel_group;

      if (config.isInstanceIdEnabled()) {
        data['instanceid'] = keychain.getInstanceId();
      }

      url = [
        origin, 'v2', 'presence', 'sub_key',
        keychain.getSubscribeKey(), 'channel', utils.encode(','), 'leave'
      ];

      params = networking.prepareParams(data);

      if (sendBeacon) {
        var url_string = utils.buildURL(url, params);
        if (sendBeacon(url_string)) {
          callback && callback({ status: 200, action: 'leave', message: 'OK', service: 'Presence' });
          return true;
        }
      }

      xdr({
        blocking: blocking || SSL,
        callback: jsonp,
        data: params,
        success: function (response) {
          Responders.callback(response, callback, err);
        },
        fail: function (response) {
          Responders.error(response, err);
        },
        url: url
      });
      return true;
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
      if (config.getPresenceTimeout() == 2) {
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
        data: obj
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

    /*
     PUBNUB.publish({
     channel : 'my_chat_channel',
     message : 'hello!'
     });
     */
    publish: function (args, callback) {
      var msg = args['message'];
      if (!msg) return error('Missing Message');

      var callback = callback || args['callback'] || msg['callback'] || args['success'] || function () {};
      var channel = args['channel'] || msg['channel'];
      var auth_key = args['auth_key'] || keychain.getAuthKey();
      var cipher_key = args['cipher_key'];
      var err = args['error'] || msg['error'] || function () {};
      var post = args['post'] || false;
      var store = ('store_in_history' in args) ? args['store_in_history'] : true;
      var jsonp = jsonp_cb();
      var add_msg = 'push';
      var params: Object = { uuid: keychain.getUUID(), auth: auth_key };
      var url;

      if (args['prepend']) add_msg = 'unshift';

      if (!channel) return error('Missing Channel');
      if (!keychain.getPublishKey()) return error('Missing Publish Key');
      if (!keychain.getSubscribeKey()) return error('Missing Subscribe Key');

      if (msg['getPubnubMessage']) {
        msg = msg['getPubnubMessage']();
      }

      // If trying to send Object
      msg = JSON.stringify(encrypt(msg, cipher_key));

      // Create URL
      url = [
        networking.getStandardOrigin(), 'publish',
        keychain.getPublishKey(), keychain.getSubscribeKey(),
        0, utils.encode(channel),
        jsonp, utils.encode(msg)
      ];

      if (!store) params['store'] = '0';

      if (config.isInstanceIdEnabled()) {
        params['instanceid'] = keychain.getInstanceId();
      }

      // Queue Message Send
      PUB_QUEUE[add_msg]({
        callback: jsonp,
        url: url,
        data: networking.prepareParams(params),
        fail: function (response) {
          Responders.error(response, err);
          publish(1);
        },
        success: function (response) {
          Responders.callback(response, callback, err);
          publish(1);
        },
        mode: (post) ? 'POST' : 'GET'
      });

      // Send Message
      publish();
    },

    /*
     PUBNUB.unsubscribe({ channel : 'my_chat' });
     */
    unsubscribe: function (args, callback) {
      var channelArg = args['channel'];
      var channelGroupArg = args['channel_group'];
      var auth_key = args['auth_key'] || keychain.getAuthKey();
      var callback = callback || args['callback'] || function () {};
      var err = args['error'] || function () {};

      TIMETOKEN = 0;
      SUB_RESTORE = 1;   // REVISIT !!!!

      if (!channelArg && !channelGroupArg) return error('Missing Channel or Channel Group');
      if (!keychain.getSubscribeKey()) return error('Missing Subscribe Key');

      if (channelArg) {
        var channels = utils.isArray(channelArg) ? channelArg : ('' + channelArg).split(',');
        var existingChannels = [];
        var presenceChannels = [];

        utils.each(channels, function (channel) {
          if (stateStorage.getChannel(channel)) existingChannels.push(channel);
        });

        // if we do not have any channels to unsubscribe from, trigger a callback.
        if (existingChannels.length == 0) {
          callback({ action: 'leave' });
          return;
        }

        // Prepare presence channels
        utils.each(existingChannels, function (channel) {
          presenceChannels.push(channel + PRESENCE_SUFFIX);
        });

        utils.each(existingChannels.concat(presenceChannels), function (channel) {
          if (stateStorage.containsChannel(channel)) stateStorage.addChannel(channel, 0);
          if (stateStorage.isInPresenceState(channel)) stateStorage.removeFromPresenceState(channel);
        });

        var CB_CALLED = true;
        if (READY) {
          CB_CALLED = SELF['LEAVE'](existingChannels.join(','), 0, auth_key, callback, err);
        }
        if (!CB_CALLED) callback({ action: 'leave' });
      }

      if (channelGroupArg) {
        var channelGroups = utils.isArray(channelGroupArg) ? channelGroupArg : ('' + channelGroupArg).split(',');
        var existingChannelGroups = [];
        var presenceChannelGroups = [];

        utils.each(channelGroups, function (channelGroup) {
          if (stateStorage.getChannelGroup(channelGroup)) existingChannelGroups.push(channelGroup);
        });

        // if we do not have any channel groups to unsubscribe from, trigger a callback.
        if (existingChannelGroups.length == 0) {
          callback({ action: 'leave' });
          return;
        }

        // Prepare presence channels
        utils.each(existingChannelGroups, function (channelGroup) {
          presenceChannelGroups.push(channelGroup + PRESENCE_SUFFIX);
        });

        utils.each(existingChannelGroups.concat(presenceChannelGroups), function (channelGroup) {
          if (stateStorage.containsChannelGroup(channelGroup)) stateStorage.addChannelGroup(channelGroup, 0);
          if (stateStorage.isInPresenceState(channelGroup)) stateStorage.removeFromPresenceState(channelGroup);
        });

        var CB_CALLED = true;
        if (READY) {
          CB_CALLED = SELF['LEAVE_GROUP'](existingChannelGroups.join(','), 0, auth_key, callback, err);
        }
        if (!CB_CALLED) callback({ action: 'leave' });
      }

      // Reset Connection if Count Less
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
      var noheresync = args['noheresync'] || 0;
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
              reconnect: reconnect
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
              channel: channel + PRESENCE_SUFFIX,
              callback: presence,
              restore: restore
            });

            // Presence Subscribed?
            if (settings.subscribed) return;

            // See Who's Here Now?
            if (noheresync) return;
            SELF['here_now']({
              channel: channel,
              data: networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() }),
              callback: function (here) {
                utils.each('uuids' in here ? here['uuids'] : [], function (uid) {
                  presence({
                    action: 'join',
                    uuid: uid,
                    timestamp: Math.floor(utils.rnow() / 1000),
                    occupancy: here['occupancy'] || 1
                  }, here, channel);
                });
              }
            });
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
              reconnect: reconnect
            });

            // Presence Enabled?
            if (!presence) return;

            // Subscribe Presence Channel
            SELF['subscribe']({
              channel_group: channel_group + PRESENCE_SUFFIX,
              callback: presence,
              restore: restore,
              auth_key: keychain.getAuthKey()
            });

            // Presence Subscribed?
            if (settings.subscribed) return;

            // See Who's Here Now?
            if (noheresync) return;
            SELF['here_now']({
              channel_group: channel_group,
              data: networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() }),
              callback: function (here) {
                utils.each('uuids' in here ? here['uuids'] : [], function (uid) {
                  presence({
                    action: 'join',
                    uuid: uid,
                    timestamp: Math.floor(utils.rnow() / 1000),
                    occupancy: here['occupancy'] || 1
                  }, here, channel_group);
                });
              }
            });
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
        var jsonp = jsonp_cb();
        var channels = stateStorage.generate_channel_list().join(',');
        var channel_groups = stateStorage.generate_channel_group_list().join(',');

        // Stop Connection
        if (!channels && !channel_groups) return;

        if (!channels) channels = ',';

        // Connect to PubNub Subscribe Servers
        _reset_offline();

        var data = networking.prepareParams({ uuid: keychain.getUUID(), auth: keychain.getAuthKey() });

        if (channel_groups) {
          data['channel-group'] = channel_groups;
        }


        var st = JSON.stringify(stateStorage.getPresenceState());
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
          callback: jsonp,
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
            jsonp, TIMETOKEN
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
                  channel.split(PRESENCE_SUFFIX)[0]
                ];
                channel2 && r.push(channel2.split(PRESENCE_SUFFIX)[0]);
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
          }
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
  map: utils.map
};
