'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createInstance;

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

var _publish_queue = require('./components/publish_queue');

var _publish_queue2 = _interopRequireDefault(_publish_queue);

var _presence_heartbeat = require('./components/presence_heartbeat');

var _presence_heartbeat2 = _interopRequireDefault(_presence_heartbeat);

var _subscriber = require('./iterators/subscriber');

var _subscriber2 = _interopRequireDefault(_subscriber);

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

var _channel_groups = require('./endpoints/channel_groups');

var _channel_groups2 = _interopRequireDefault(_channel_groups);

var _subscribe = require('./endpoints/subscribe');

var _subscribe2 = _interopRequireDefault(_subscribe);

var _publish = require('./endpoints/publish');

var _publish2 = _interopRequireDefault(_publish);

var _flow_interfaces = require('./flow_interfaces');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var packageJSON = require('../../package.json');

var utils = require('./utils');

var DEF_WINDOWING = 10; // MILLISECONDS.
var DEF_TIMEOUT = 15000; // MILLISECONDS.
var DEF_SUB_TIMEOUT = 310; // SECONDS.
var DEF_KEEPALIVE = 60; // SECONDS (FOR TIMESYNC).

// function to call when a new presence shows up
function createInstance(setup) {
  var shutdown = setup.shutdown;
  var useSendBeacon = typeof setup.use_send_beacon !== 'undefined' ? setup.use_send_beacon : true;
  var sendBeacon = useSendBeacon ? setup.sendBeacon : null;
  var db = setup.db || { get: function get() {}, set: function set() {} };
  var error = setup.error || function () {};

  var subscribeTimeout = setup.subscribeTimeout;
  var transactionalTimeout = setup.transactionalTimeout;

  var hmac_SHA256 = setup.hmac_SHA256;
  var crypto_obj = setup.crypto_obj || {
    encrypt: function encrypt(a) {
      return a;
    },
    decrypt: function decrypt(b) {
      return b;
    }
  };

  // initialize the encryption and decryption logic
  function encrypt(input, key) {
    return crypto_obj.encrypt(input, key || keychain.getCipherKey()) || input;
  }

  function decrypt(input, key) {
    return crypto_obj['decrypt'](input, key || keychain.getCipherKey()) || crypto_obj['decrypt'](input, keychain.getCipherKey()) || input;
  }

  var callbacks = {
    onMessage: setup.onMessage,
    onStatus: setup.onStatus,
    onPresence: setup.onPresence
  };

  var keychain = new _keychain2.default().setInstanceId(_uuid2.default.v4()).setAuthKey(setup.authKey || '').setSecretKey(setup.secretKey || '').setSubscribeKey(setup.subscribeKey).setPublishKey(setup.publishKey).setCipherKey(setup.cipherKey);

  keychain.setUUID(setup.uuid || !setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || _uuid2.default.v4());

  // write the new key to storage
  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

  var config = new _config2.default().setRequestIdConfig(setup.use_request_id || false).setPresenceTimeout(utils.validateHeartbeat(setup.heartbeat || setup.pnexpires || 0, error)).setSupressLeaveEvents(setup.noleave || 0)
  // .setSubscribeWindow(+setup.windowing || DEF_WINDOWING)
  // .setSubscribeTimeout((+setup.timeout || DEF_SUB_TIMEOUT) * constants.SECOND)
  .setInstanceIdConfig(setup.instance_id || false);

  config.setHeartbeatInterval(setup.heartbeat_interval || config.getPresenceTimeout() / 2 - 1);

  // set timeout to how long a transaction request will wait for the server (default 15 seconds)
  config.transactionalRequestTimeout = parseInt(setup.transactionalRequestTimeout, 2) || 15 * 1000;
  // set timeout to how long a subscribe event loop will run (default 310 seconds)
  config.subscribeRequestTimeout = parseInt(setup.subscribeRequestTimeout, 2) || 310 * 1000;

  var stateStorage = new _state2.default();

  var networking = new _networking2.default({ config: config, keychain: keychain, encrypt: encrypt, sendBeacon: sendBeacon }, setup.ssl, setup.origin);
  // .setRequestTimeout(setup.timeout || DEF_TIMEOUT)

  var publishQueue = new _publish_queue2.default({ networking: networking });
  var subscriber = new _subscriber2.default({ networking: networking, state: stateStorage });

  // initalize the endpoints
  var timeEndpoint = new _time2.default({ networking: networking });
  var historyEndpoint = new _history2.default({ networking: networking, decrypt: decrypt });
  var channelGroupEndpoints = new _channel_groups2.default({ networking: networking });
  var publishEndpoints = new _publish2.default({ publishQueue: publishQueue });
  var pushEndpoints = new _push2.default({ networking: networking, publishQueue: publishQueue });

  var presenceEndpoints = new _presence2.default({ keychain: keychain, config: config, networking: networking, error: error, state: stateStorage });

  var accessEndpoints = new _access2.default({ keychain: keychain, config: config, networking: networking, error: error, hmac_SHA256: hmac_SHA256 });

  var subscribeEndpoints = new _subscribe2.default({ networking: networking, callbacks: callbacks, config: config, state: stateStorage });

  var presenceHeartbeat = new _presence_heartbeat2.default(config, stateStorage, presenceEndpoints);
  // let connectivity = new Connectivity({ eventEmitter, networking, timeEndpoint });

  if (config.getPresenceTimeout() === 2) {
    config.setHeartbeatInterval(1);
  }

  var SELF = {

    accessManager: {
      grant: accessEndpoints.grant.bind(accessEndpoints),
      audit: accessEndpoints.audit.bind(accessEndpoints),
      revoke: accessEndpoints.revoke.bind(accessEndpoints)
    },

    channelGroups: {
      listGroups: channelGroupEndpoints.listGroups.bind(channelGroupEndpoints),
      deleteGroup: channelGroupEndpoints.removeGroup.bind(channelGroupEndpoints),
      listChannels: channelGroupEndpoints.listChannels.bind(channelGroupEndpoints),
      addChannel: channelGroupEndpoints.addChannel.bind(channelGroupEndpoints),
      removeChannel: channelGroupEndpoints.addChannel.bind(channelGroupEndpoints)
    },

    history: historyEndpoint.fetch.bind(historyEndpoint),
    time: timeEndpoint.fetch.bind(timeEndpoint),

    publish: publishEndpoints.publish.bind(publishEndpoints),
    subscribe: subscribeEndpoints.subscribe.bind(subscribeEndpoints),
    unsubscribe: subscribeEndpoints.unsubscribe.bind(subscribeEndpoints),

    presence: {
      hereNow: presenceEndpoints.hereNow.bind(presenceEndpoints),
      whereNow: presenceEndpoints.whereNow.bind(presenceEndpoints),
      getState: presenceEndpoints.getState.bind(presenceEndpoints),
      setState: presenceEndpoints.setState.bind(presenceEndpoints)
    },

    push: {
      addDeviceToPushChannel: pushEndpoints.addDeviceToPushChannel.bind(pushEndpoints),
      removeDeviceFromPushChannel: pushEndpoints.removeDeviceFromPushChannel.bind(pushEndpoints),
      send: pushEndpoints.send.bind(pushEndpoints)
    },

    getCipherKey: function getCipherKey() {
      return keychain.getCipherKey();
    },
    setCipherKey: function setCipherKey(key) {
      keychain.setCipherKey(key);
    },
    rawEncrypt: function rawEncrypt(input, key) {
      return encrypt(input, key);
    },
    rawDecrypt: function rawDecrypt(input, key) {
      return decrypt(input, key);
    },
    getHeartbeat: function getHeartbeat() {
      return config.getPresenceTimeout();
    },
    setHeartbeat: function setHeartbeat(heartbeat, heartbeat_interval) {
      config.setPresenceTimeout(utils.validateHeartbeat(heartbeat, config.getPresenceTimeout(), error));
      config.setHeartbeatInterval(heartbeat_interval || config.getPresenceTimeout() / 2 - 1);
      if (config.getPresenceTimeout() === 2) {
        config.setHeartbeatInterval(1);
      }

      // emit the event
      // eventEmitter.emit('presenceHeartbeatChanged');
    },
    getHeartbeatInterval: function getHeartbeatInterval() {
      return config.getHeartbeatInterval();
    },
    setHeartbeatInterval: function setHeartbeatInterval(heartbeatInterval) {
      config.setHeartbeatInterval(heartbeatInterval);
      // eventEmitter.emit('presenceHeartbeatChanged');
    },
    getVersion: function getVersion() {
      return packageJSON.version;
    },
    addParam: function addParam(key, val) {
      networking.addCoreParam(key, val);
    },
    setAuthKey: function setAuthKey(auth) {
      keychain.setAuthKey(auth);
      // eventEmitter.emit('keychainChanged');
    },
    setUUID: function setUUID(uuid) {
      keychain.setUUID(uuid);
      // eventEmitter.emit('keychainChanged');
    },
    getUUID: function getUUID() {
      return keychain.getUUID();
    },
    getSubscribedChannels: function getSubscribedChannels() {
      return stateStorage.generate_channel_list(true);
    },
    stopTimers: function stopTimers() {
      // connectivity.stop();
      presenceHeartbeat.stop();
    },
    shutdown: function (_shutdown) {
      function shutdown() {
        return _shutdown.apply(this, arguments);
      }

      shutdown.toString = function () {
        return _shutdown.toString();
      };

      return shutdown;
    }(function () {
      SELF.stopTimers();
      if (shutdown) shutdown();
    })
  };

  /*
    create the connectivity element last, this will signal to other elements
    that the SDK is connected to internet.
  */
  // connectivity.start();
  subscriber.start();

  return SELF;
}