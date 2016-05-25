'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _networking = require('./components/networking');

var _networking2 = _interopRequireDefault(_networking);

var _config = require('./components/config');

var _config2 = _interopRequireDefault(_config);

var _state = require('./components/state');

var _state2 = _interopRequireDefault(_state);

var _publish_queue = require('./components/publish_queue');

var _publish_queue2 = _interopRequireDefault(_publish_queue);

var _index = require('./components/cryptography/index');

var _index2 = _interopRequireDefault(_index);

var _presence_heartbeat = require('./iterators/presence_heartbeat');

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
function createInstance(setup) {
  var sendBeacon = setup.sendBeacon;
  var db = setup.db;
  var _shutdown = setup.shutdown;


  var config = new _config2.default(setup);

  if (setup.presenceAnnounceInterval) {
    config.setPresenceAnnounceInterval(setup.presenceAnnounceInterval);
  }

  var state = new _state2.default();
  var callbacks = {
    onMessage: setup.onMessage,
    onStatus: setup.onStatus,
    onPresence: setup.onPresence
  };

  // write the new key to storage
  db.set(config.getSubscribeKey() + 'uuid', config.getUUID());

  var crypto = new _index2.default({ config: config });
  var networking = new _networking2.default({ config: config, crypto: crypto, sendBeacon: sendBeacon });
  var publishQueue = new _publish_queue2.default({ networking: networking });
  var subscriber = new _subscriber2.default({ networking: networking, state: state, callbacks: callbacks });

  // init the endpoints
  var timeEndpoint = new _time2.default({ networking: networking });
  var historyEndpoint = new _history2.default({ networking: networking, crypto: crypto });
  var channelGroupEndpoints = new _channel_groups2.default({ networking: networking });
  var publishEndpoints = new _publish2.default({ publishQueue: publishQueue });
  var pushEndpoints = new _push2.default({ networking: networking, publishQueue: publishQueue });
  var presenceEndpoints = new _presence2.default({ config: config, networking: networking, state: state });
  var accessEndpoints = new _access2.default({ config: config, networking: networking });
  var subscribeEndpoints = new _subscribe2.default({ networking: networking, callbacks: callbacks, config: config, state: state });

  var presenceHeartbeat = new _presence_heartbeat2.default({ callbacks: callbacks, state: state, presenceEndpoints: presenceEndpoints });

  // let connectivity = new Connectivity({ eventEmitter, networking, timeEndpoint });

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

    getPresenceTimeout: config.getPresenceTimeout.bind(config),
    setPresenceTimeout: config.setPresenceTimeout.bind(config),

    getPresenceAnnounceInterval: config.getPresenceAnnounceInterval.bind(config),
    setPresenceAnnounceInterval: config.setPresenceAnnounceInterval.bind(config),

    setAuthKey: config.setAuthKey.bind(config),

    setUUID: config.setUUID.bind(config),
    getUUID: config.getUUID.bind(config),

    setCipherKey: config.setCipherKey.bind(config),
    getCipherKey: config.getCipherKey.bind(config),

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
  presenceHeartbeat.start();

  return SELF;
}
exports.default = createInstance;