'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _networking = require('./components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _keychain = require('./components/keychain');

var _keychain2 = _interopRequireDefault(_keychain);

var _config = require('./components/config');

var _config2 = _interopRequireDefault(_config);

var _state = require('./components/state');

var _state2 = _interopRequireDefault(_state);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _responders = require('./presenters/responders');

var _responders2 = _interopRequireDefault(_responders);

var _time = require('./endpoints/time');

var _time2 = _interopRequireDefault(_time);

var _presence = require('./endpoints/presence');

var _presence2 = _interopRequireDefault(_presence);

var _history = require('./endpoints/history');

var _history2 = _interopRequireDefault(_history);

var _push = require('./endpoints/push');

var _push2 = _interopRequireDefault(_push);

var _access = require('./endpoints/access');

var _access2 = _interopRequireDefault(_access);

var _replay = require('./endpoints/replay');

var _replay2 = _interopRequireDefault(_replay);

var _channel_groups = require('./endpoints/channel_groups');

var _channel_groups2 = _interopRequireDefault(_channel_groups);

var _pubsub = require('./endpoints/pubsub');

var _pubsub2 = _interopRequireDefault(_pubsub);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var packageJSON = require('../../package.json');
var defaultConfiguration = require('../../defaults.json');
var utils = require('./utils');

var NOW = 1;
var READY = false;
var READY_BUFFER = [];
var DEF_WINDOWING = 10; // MILLISECONDS.
var DEF_TIMEOUT = 15000; // MILLISECONDS.
var DEF_SUB_TIMEOUT = 310; // SECONDS.
var DEF_KEEPALIVE = 60; // SECONDS (FOR TIMESYNC).
var SECOND = 1000; // A THOUSAND MILLISECONDS.

var SDK_VER = packageJSON.version;

/**
 * UTILITIES
 */
function unique() {
  return 'x' + ++NOW + '' + +new Date();
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
    var m = {};

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

// hashing function required for Access Manager


function PN_API(setup) {
  var useSendBeacon = typeof setup.use_send_beacon !== 'undefined' ? setup.use_send_beacon : true;
  var sendBeacon = useSendBeacon ? setup.sendBeacon : null;
  var xdr = setup.xdr;

  var db = setup.db || { get: function get() {}, set: function set() {} };
  var _error = setup.error || function () {};
  var hmac_SHA256 = setup.hmac_SHA256;
  var crypto_obj = setup.crypto_obj || {
    encrypt: function encrypt(a) {
      return a;
    },
    decrypt: function decrypt(b) {
      return b;
    }
  };

  var keychain = new _keychain2.default().setInstanceId(_uuid2.default.v4()).setAuthKey(setup.auth_key || '').setSecretKey(setup.secret_key || '').setSubscribeKey(setup.subscribe_key).setPublishKey(setup.publish_key).setCipherKey(setup.cipher_key);

  keychain.setUUID(setup.uuid || !setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || _uuid2.default.v4());

  // write the new key to storage
  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

  var config = new _config2.default().setRequestIdConfig(setup.use_request_id || false).setPresenceTimeout(utils.validateHeartbeat(setup.heartbeat || setup.pnexpires || 0, _error)).setSupressLeaveEvents(setup.noleave || 0).setInstanceIdConfig(setup.instance_id || false);

  config.setHeartbeatInterval(setup.heartbeat_interval || config.getPresenceTimeout() / 2 - 1);

  var stateStorage = new _state2.default();

  var networking = new _networking2.default(setup.xdr, keychain, setup.ssl, setup.origin).addBeaconDispatcher(sendBeacon).setCoreParams(setup.params || {});

  // initialize the encryption and decryption logic
  function encrypt(input, key) {
    return crypto_obj.encrypt(input, key || keychain.getCipherKey()) || input;
  }

  function decrypt(input, key) {
    return crypto_obj['decrypt'](input, key || keychain.getCipherKey()) || crypto_obj['decrypt'](input, keychain.getCipherKey()) || input;
  }

  // initalize the endpoints
  var timeEndpoint = new _time2.default({ keychain: keychain, config: config, networking: networking });
  var pushEndpoint = new _push2.default({ keychain: keychain, config: config, networking: networking, error: _error });
  var presenceEndpoints = new _presence2.default({ keychain: keychain, config: config, networking: networking, error: _error, state: stateStorage });
  var historyEndpoint = new _history2.default({ keychain: keychain, networking: networking, error: _error, decrypt: decrypt });
  var accessEndpoints = new _access2.default({ keychain: keychain, config: config, networking: networking, error: _error, hmac_SHA256: hmac_SHA256 });
  var replayEndpoint = new _replay2.default({ keychain: keychain, networking: networking, error: _error });
  var channelGroupEndpoints = new _channel_groups2.default({ keychain: keychain, networking: networking, config: config, error: _error });
  var pubsubEndpoints = new _pubsub2.default({ keychain: keychain, networking: networking, presenceEndpoints: presenceEndpoints, state: stateStorage });

  var SUB_WINDOWING = +setup['windowing'] || DEF_WINDOWING;
  var SUB_TIMEOUT = (+setup['timeout'] || DEF_SUB_TIMEOUT) * SECOND;
  var KEEPALIVE = (+setup['keepalive'] || DEF_KEEPALIVE) * SECOND;
  var TIME_CHECK = setup['timecheck'] || 0;
  var CONNECT = function CONNECT() {};
  var PUB_QUEUE = [];
  var TIME_DRIFT = 0;
  var SUB_CALLBACK = 0;
  var SUB_CHANNEL = 0;
  var SUB_RECEIVER = 0;
  var SUB_RESTORE = setup['restore'] || 0;
  var TIMETOKEN = 0;
  var RESUMED = false;
  var SUB_ERROR = function SUB_ERROR() {};
  var PRESENCE_HB_TIMEOUT = null;
  var PRESENCE_HB_RUNNING = false;
  var NO_WAIT_FOR_PENDING = setup['no_wait_for_pending'];
  var _is_online = setup['_is_online'] || function () {
    return 1;
  };
  var _shutdown = setup['shutdown'];
  var _poll_timer = void 0;
  var _poll_timer2 = void 0;

  if (config.getPresenceTimeout() === 2) {
    config.setHeartbeatInterval(1);
  }

  function _presence_heartbeat() {
    clearTimeout(PRESENCE_HB_TIMEOUT);

    if (!config.getHeartbeatInterval() || config.getHeartbeatInterval() >= 500 || config.getHeartbeatInterval() < 1 || !stateStorage.generate_channel_list(true).length && !stateStorage.generate_channel_group_list(true).length) {
      PRESENCE_HB_RUNNING = false;
      return;
    }

    PRESENCE_HB_RUNNING = true;
    SELF['presence_heartbeat']({
      callback: function callback(r) {
        PRESENCE_HB_TIMEOUT = utils.timeout(_presence_heartbeat, config.getHeartbeatInterval() * SECOND);
      },
      error: function error(e) {
        _error && _error('Presence Heartbeat unable to reach Pubnub servers.' + JSON.stringify(e));
        PRESENCE_HB_TIMEOUT = utils.timeout(_presence_heartbeat, config.getHeartbeatInterval() * SECOND);
      }
    });
  }

  function start_presence_heartbeat() {
    !PRESENCE_HB_RUNNING && _presence_heartbeat();
  }

  function _publish(next) {
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
      (callback || function () {})(chang);
    });

    return count;
  }

  function each_channel(callback) {
    var count = 0;

    utils.each(stateStorage.generate_channel_list(), function (channel) {
      var chan = stateStorage.getChannel(channel);

      if (!chan) return;

      count++;
      (callback || function () {})(chan);
    });

    return count;
  }

  // Announce Leave Event
  var SELF = {
    history: function history(args, callback) {
      historyEndpoint.fetchHistory(args, callback);
    },
    time: function time(callback) {
      timeEndpoint.fetchTime(callback);
    },
    here_now: function here_now(args, callback) {
      presenceEndpoints.hereNow(args, callback);
    },
    where_now: function where_now(args, callback) {
      presenceEndpoints.whereNow(args, callback);
    },
    presence_heartbeat: function presence_heartbeat(args) {
      presenceEndpoints.heartbeat(args);
    },
    state: function state(args, callback) {
      presenceEndpoints.performState(args, callback);
    },
    grant: function grant(args, callback) {
      accessEndpoints.performGrant(args, callback);
    },
    audit: function audit(args, callback) {
      accessEndpoints.performAudit(args, callback);
    },
    mobile_gw_provision: function mobile_gw_provision(args) {
      pushEndpoint.provisionDevice(args);
    },
    replay: function replay(args, callback) {
      replayEndpoint.performReplay(args, callback);
    },


    // channel groups related
    channel_group: function channel_group(args, callback) {
      channelGroupEndpoints.channelGroup(args, callback);
    },
    channel_group_list_groups: function channel_group_list_groups(args, callback) {
      channelGroupEndpoints.listGroups(args, callback);
    },
    channel_group_remove_group: function channel_group_remove_group(args, callback) {
      channelGroupEndpoints.removeGroup(args, callback);
    },
    channel_group_list_channels: function channel_group_list_channels(args, callback) {
      channelGroupEndpoints.listChannels(args, callback);
    },
    channel_group_add_channel: function channel_group_add_channel(args, callback) {
      channelGroupEndpoints.addChannel(args, callback);
    },
    channel_group_remove_channel: function channel_group_remove_channel(args, callback) {
      channelGroupEndpoints.removeChannel(args, callback);
    },


    set_resumed: function set_resumed(resumed) {
      RESUMED = resumed;
    },

    get_cipher_key: function get_cipher_key() {
      return keychain.getCipherKey();
    },

    set_cipher_key: function set_cipher_key(key) {
      keychain.setCipherKey(key);
    },

    raw_encrypt: function raw_encrypt(input, key) {
      return encrypt(input, key);
    },

    raw_decrypt: function raw_decrypt(input, key) {
      return decrypt(input, key);
    },

    get_heartbeat: function get_heartbeat() {
      return config.getPresenceTimeout();
    },

    set_heartbeat: function set_heartbeat(heartbeat, heartbeat_interval) {
      config.setPresenceTimeout(utils.validateHeartbeat(heartbeat, config.getPresenceTimeout(), _error));
      config.setHeartbeatInterval(heartbeat_interval || config.getPresenceTimeout() / 2 - 1);
      if (config.getPresenceTimeout() === 2) {
        config.setHeartbeatInterval(1);
      }
      CONNECT();
      _presence_heartbeat();
    },

    get_heartbeat_interval: function get_heartbeat_interval() {
      return config.getHeartbeatInterval();
    },

    set_heartbeat_interval: function set_heartbeat_interval(heartbeat_interval) {
      config.setHeartbeatInterval(heartbeat_interval);
      _presence_heartbeat();
    },

    get_version: function get_version() {
      return SDK_VER;
    },

    getGcmMessageObject: function getGcmMessageObject(obj) {
      return {
        data: obj
      };
    },

    getApnsMessageObject: function getApnsMessageObject(obj) {
      var x = {
        aps: { badge: 1, alert: '' }
      };
      for (var k in obj) {
        k[x] = obj[k];
      }
      return x;
    },

    _add_param: function _add_param(key, val) {
      networking.addCoreParam(key, val);
    },

    /*
     PUBNUB.auth('AJFLKAJSDKLA');
     */
    auth: function auth(_auth) {
      keychain.setAuthKey(_auth);
      CONNECT();
    },

    /*
     PUBNUB.publish({
     channel : 'my_chat_channel',
     message : 'hello!'
     });
     */
    publish: function publish(args, callback) {
      var msg = args['message'];
      if (!msg) return _error('Missing Message');

      var callback = callback || args['callback'] || msg['callback'] || args['success'] || function () {};
      var channel = args['channel'] || msg['channel'];
      var auth_key = args['auth_key'] || keychain.getAuthKey();
      var cipher_key = args['cipher_key'];
      var err = args['error'] || msg['error'] || function () {};
      var post = args['post'] || false;
      var store = 'store_in_history' in args ? args['store_in_history'] : true;
      var add_msg = 'push';
      var params = { uuid: keychain.getUUID(), auth: auth_key };
      var url;

      if (args['prepend']) add_msg = 'unshift';

      if (!channel) return _error('Missing Channel');
      if (!keychain.getPublishKey()) return _error('Missing Publish Key');
      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

      if (msg['getPubnubMessage']) {
        msg = msg['getPubnubMessage']();
      }

      // If trying to send Object
      msg = JSON.stringify(encrypt(msg, cipher_key));

      // Create URL
      url = [networking.getStandardOrigin(), 'publish', keychain.getPublishKey(), keychain.getSubscribeKey(), 0, utils.encode(channel), 0, utils.encode(msg)];

      if (!store) params['store'] = '0';

      if (config.isInstanceIdEnabled()) {
        params['instanceid'] = keychain.getInstanceId();
      }

      // Queue Message Send
      PUB_QUEUE[add_msg]({
        url: url,
        data: networking.prepareParams(params),
        fail: function fail(response) {
          _responders2.default.error(response, err);
          _publish(1);
        },
        success: function success(response) {
          _responders2.default.callback(response, callback, err);
          _publish(1);
        },
        mode: post ? 'POST' : 'GET'
      });

      // Send Message
      _publish();
    },

    unsubscribe: function unsubscribe(args, callback) {
      TIMETOKEN = 0;
      SUB_RESTORE = 1; // REVISIT !!!!

      pubsubEndpoints.performUnsubscribe(args, callback);

      CONNECT();
    },


    /*
     PUBNUB.subscribe({
     channel  : 'my_chat'
     callback : function(message) { }
     });
     */
    subscribe: function subscribe(args, callback) {
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
        return _error('Missing Channel');
      }

      if (!callback) return _error('Missing Callback');
      if (!keychain.getSubscribeKey()) return _error('Missing Subscribe Key');

      if (heartbeat || heartbeat === 0 || heartbeat_interval || heartbeat_interval === 0) {
        SELF['set_heartbeat'](heartbeat, heartbeat_interval);
      }

      // Setup Channel(s)
      if (channel) {
        utils.each((channel.join ? channel.join(',') : '' + channel).split(','), function (channel) {
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
            channel: channel + defaultConfiguration.PRESENCE_SUFFIX,
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
            callback: function callback(here) {
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
        utils.each((channel_group.join ? channel_group.join(',') : '' + channel_group).split(','), function (channel_group) {
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
            channel_group: channel_group + defaultConfiguration.PRESENCE_SUFFIX,
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
            callback: function callback(here) {
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
          fail: function fail(response) {
            if (response && response['error'] && response['service']) {
              _responders2.default.error(response, SUB_ERROR);
              _test_connection(false);
            } else {
              SELF['time'](function (success) {
                !success && _responders2.default.error(response, SUB_ERROR);
                _test_connection(success);
              });
            }
          },
          data: networking.prepareParams(data),
          url: [networking.getSubscribeOrigin(), 'subscribe', keychain.getSubscribeKey(), utils.encode(channels), 0, TIMETOKEN],
          success: function success(messages) {
            // Check for Errors
            if (!messages || (typeof messages === 'undefined' ? 'undefined' : _typeof(messages)) == 'object' && 'error' in messages && messages['error']) {
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
            var next_callback = function () {
              var channels = '';
              var channels2 = '';

              if (messages.length > 3) {
                channels = messages[3];
                channels2 = messages[2];
              } else if (messages.length > 2) {
                channels = messages[2];
              } else {
                channels = utils.map(stateStorage.generate_channel_list(), function (chan) {
                  return utils.map(Array(messages[0].length).join(',').split(','), function () {
                    return chan;
                  });
                }).join(',');
              }

              var list = channels.split(',');
              var list2 = channels2 ? channels2.split(',') : [];

              return function () {
                var channel = list.shift() || SUB_CHANNEL;
                var channel2 = list2.shift();

                var chobj = {};

                if (channel2) {
                  if (channel && channel.indexOf('-pnpres') >= 0 && channel2.indexOf('-pnpres') < 0) {
                    channel2 += '-pnpres';
                  }
                  chobj = stateStorage.getChannelGroup(channel2) || stateStorage.getChannel(channel2) || { callback: function callback() {} };
                } else {
                  chobj = stateStorage.getChannel(channel);
                }

                var r = [chobj.callback || SUB_CALLBACK, channel.split(defaultConfiguration.PRESENCE_SUFFIX)[0]];
                channel2 && r.push(channel2.split(defaultConfiguration.PRESENCE_SUFFIX)[0]);
                return r;
              };
            }();

            var latency = detect_latency(+messages[1]);
            utils.each(messages[0], function (msg) {
              var next = next_callback();
              var decrypted_msg = decrypt(msg, stateStorage.getChannel(next[1]) ? stateStorage.getChannel(next[1])['cipher_key'] : null);
              next[0] && next[0](decrypted_msg, messages, next[2] || next[1], latency, next[1]);
            });

            utils.timeout(_connect, windowing);
          }
        });
      }

      CONNECT = function CONNECT() {
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
    revoke: function revoke(args, callback) {
      args['read'] = false;
      args['write'] = false;
      SELF['grant'](args, callback);
    },

    set_uuid: function set_uuid(uuid) {
      keychain.setUUID(uuid);
      CONNECT();
    },

    get_uuid: function get_uuid() {
      return keychain.getUUID();
    },

    isArray: function isArray(arg) {
      return utils.isArray(arg);
    },

    get_subscribed_channels: function get_subscribed_channels() {
      return stateStorage.generate_channel_list(true);
    },

    stop_timers: function stop_timers() {
      clearTimeout(_poll_timer);
      clearTimeout(_poll_timer2);
      clearTimeout(PRESENCE_HB_TIMEOUT);
    },

    shutdown: function shutdown() {
      SELF['stop_timers']();
      _shutdown && _shutdown();
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
    offline: function offline() {
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
      detect_time_detla(function () {}, success);
      success || _reset_offline(1, {
        error: 'Heartbeat failed to connect to Pubnub Servers.' + 'Please check your network settings.'
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