'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

var _index = require('./components/cryptography/index');

var _index2 = _interopRequireDefault(_index);

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

function createInstance(setup) {
  var sendBeacon = setup.sendBeacon;
  var db = setup.db;
  var _shutdown = setup.shutdown;


  var callbacks = {
    onMessage: setup.onMessage,
    onStatus: setup.onStatus,
    onPresence: setup.onPresence
  };

  var keychain = new _keychain2.default().setInstanceId(_uuid2.default.v4()).setAuthKey(setup.authKey || '').setSecretKey(setup.secretKey || '').setSubscribeKey(setup.subscribeKey).setPublishKey(setup.publishKey).setCipherKey(setup.cipherKey);

  keychain.setUUID(setup.uuid || !setup.unique_uuid && db.get(keychain.getSubscribeKey() + 'uuid') || _uuid2.default.v4());

  // write the new key to storage
  db.set(keychain.getSubscribeKey() + 'uuid', keychain.getUUID());

  var config = new _config2.default().setRequestIdConfig(setup.use_request_id || false).setPresenceTimeout(utils.validateHeartbeat(setup.heartbeat || setup.pnexpires || 0)).setSupressLeaveEvents(setup.noleave || 0)
  // .setSubscribeWindow(+setup.windowing || DEF_WINDOWING)
  // .setSubscribeTimeout((+setup.timeout || DEF_SUB_TIMEOUT) * constants.SECOND)
  .setInstanceIdConfig(setup.instance_id || false);

  config.setHeartbeatInterval(setup.heartbeat_interval || config.getPresenceTimeout() / 2 - 1);

  // set timeout to how long a transaction request will wait for the server (default 15 seconds)
  config.transactionalRequestTimeout = setup.transactionalRequestTimeout || 15 * 1000;
  // set timeout to how long a subscribe event loop will run (default 310 seconds)
  config.subscribeRequestTimeout = setup.subscribeRequestTimeout || 310 * 1000;
  // set config on beacon (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) usage
  config.useSendBeacon = setup.useSendBeacon || true;

  var state = new _state2.default();
  var crypto = new _index2.default({ keychain: keychain });
  var networking = new _networking2.default({ config: config, keychain: keychain, crypto: crypto, sendBeacon: sendBeacon }, setup.ssl, setup.origin);
  var publishQueue = new _publish_queue2.default({ networking: networking });
  var subscriber = new _subscriber2.default({ networking: networking, state: state, callbacks: callbacks });

  // initalize the endpoints
  var timeEndpoint = new _time2.default({ networking: networking });
  var historyEndpoint = new _history2.default({ networking: networking, crypto: crypto });
  var channelGroupEndpoints = new _channel_groups2.default({ networking: networking });
  var publishEndpoints = new _publish2.default({ publishQueue: publishQueue });
  var pushEndpoints = new _push2.default({ networking: networking, publishQueue: publishQueue });

  var presenceEndpoints = new _presence2.default({ keychain: keychain, config: config, networking: networking, state: state });

  var accessEndpoints = new _access2.default({ keychain: keychain, config: config, networking: networking });

  var subscribeEndpoints = new _subscribe2.default({ networking: networking, callbacks: callbacks, config: config, state: state });

  var presenceHeartbeat = new _presence_heartbeat2.default({ config: config, state: state, presenceEndpoints: presenceEndpoints });
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

    getHeartbeat: function getHeartbeat() {
      return config.getPresenceTimeout();
    },
    setHeartbeat: function setHeartbeat(heartbeat, heartbeat_interval) {
      config.setPresenceTimeout(utils.validateHeartbeat(heartbeat, config.getPresenceTimeout(), error));
      config.setHeartbeatInterval(heartbeat_interval || config.getPresenceTimeout() / 2 - 1);
      if (config.getPresenceTimeout() === 2) {
        config.setHeartbeatInterval(1);
      }
    },
    getHeartbeatInterval: function getHeartbeatInterval() {
      return config.getHeartbeatInterval();
    },
    setHeartbeatInterval: function setHeartbeatInterval(heartbeatInterval) {
      config.setHeartbeatInterval(heartbeatInterval);
    },
    setAuthKey: function setAuthKey(auth) {
      keychain.setAuthKey(auth);
    },


    setUUID: keychain.setUUID.bind(keychain),
    getUUID: keychain.getUUID.bind(keychain),

    setCipherKey: keychain.setCipherKey.bind(keychain),
    getCipherKey: keychain.getCipherKey.bind(keychain),

    getSubscribedChannels: state.getSubscribedChannels.bind(state),

    stopTimers: function stopTimers() {
      // connectivity.stop();
      presenceHeartbeat.stop();
    },
    getVersion: function getVersion() {
      return packageJSON.version;
    },
    shutdown: function shutdown() {
      SELF.stopTimers();
      if (_shutdown) _shutdown();
    }
  };

  /*
    create the connectivity element last, this will signal to other elements
    that the SDK is connected to internet.
  */
  // connectivity.start();
  subscriber.start();

  return SELF;
}
exports.default = createInstance;