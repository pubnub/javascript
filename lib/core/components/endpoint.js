'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (modules, endpoint) {
  var networking = modules.networking,
      config = modules.config;

  var callback = null;
  var promiseComponent = null;
  var incomingParams = {};

  if (endpoint.getOperation() === _operations2.default.PNTimeOperation || endpoint.getOperation() === _operations2.default.PNChannelGroupsOperation) {
    callback = arguments.length <= 2 ? undefined : arguments[2];
  } else {
    incomingParams = arguments.length <= 2 ? undefined : arguments[2];
    callback = arguments.length <= 3 ? undefined : arguments[3];
  }

  if (typeof Promise !== 'undefined' && !callback) {
    promiseComponent = _utils2.default.createPromise();
  }

  var validationResult = endpoint.validateParams(modules, incomingParams);

  if (validationResult) {
    if (callback) {
      return callback(createValidationError(validationResult));
    } else if (promiseComponent) {
      promiseComponent.reject(new PubNubError('Validation failed, check status for details', createValidationError(validationResult)));
      return promiseComponent.promise;
    }
    return;
  }

  var outgoingParams = endpoint.prepareParams(modules, incomingParams);
  var url = decideURL(endpoint, modules, incomingParams);
  var callInstance = void 0;
  var networkingParams = { url: url,
    operation: endpoint.getOperation(),
    timeout: endpoint.getRequestTimeout(modules)
  };

  outgoingParams.uuid = config.UUID;
  outgoingParams.pnsdk = generatePNSDK(config);

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = _uuid2.default.createUUID();
  }

  if (endpoint.isAuthSupported() && config.getAuthKey()) {
    outgoingParams.auth = config.getAuthKey();
  }

  if (config.secretKey) {
    signRequest(modules, url, outgoingParams);
  }

  var onResponse = function onResponse(status, payload) {
    if (status.error) {
      if (callback) {
        callback(status);
      } else if (promiseComponent) {
        promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', status));
      }
      return;
    }

    var parsedPayload = endpoint.handleResponse(modules, payload, incomingParams);

    if (callback) {
      callback(status, parsedPayload);
    } else if (promiseComponent) {
      promiseComponent.fulfill(parsedPayload);
    }
  };

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    var payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else if (endpoint.useDelete && endpoint.useDelete()) {
    callInstance = networking.DELETE(outgoingParams, networkingParams, onResponse);
  } else {
    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
  }

  if (endpoint.getOperation() === _operations2.default.PNSubscribeOperation) {
    return callInstance;
  }

  if (promiseComponent) {
    return promiseComponent.promise;
  }
};

var _uuid = require('./uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _flow_interfaces = require('../flow_interfaces');

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _operations = require('../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PubNubError = function (_Error) {
  _inherits(PubNubError, _Error);

  function PubNubError(message, status) {
    _classCallCheck(this, PubNubError);

    var _this = _possibleConstructorReturn(this, (PubNubError.__proto__ || Object.getPrototypeOf(PubNubError)).call(this, message));

    _this.name = _this.constructor.name;
    _this.status = status;
    _this.message = message;
    return _this;
  }

  return PubNubError;
}(Error);

function createError(errorPayload, type) {
  errorPayload.type = type;
  errorPayload.error = true;
  return errorPayload;
}

function createValidationError(message) {
  return createError({ message: message }, 'validationError');
}

function decideURL(endpoint, modules, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return endpoint.postURL(modules, incomingParams);
  } else {
    return endpoint.getURL(modules, incomingParams);
  }
}

function generatePNSDK(config) {
  if (config.sdkName) {
    return config.sdkName;
  }

  var base = 'PubNub-JS-' + config.sdkFamily;

  if (config.partnerId) {
    base += '-' + config.partnerId;
  }

  base += '/' + config.getVersion();

  return base;
}

function signRequest(modules, url, outgoingParams) {
  var config = modules.config,
      crypto = modules.crypto;


  outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
  var signInput = config.subscribeKey + '\n' + config.publishKey + '\n' + url + '\n';
  signInput += _utils2.default.signPamFromParams(outgoingParams);

  var signature = crypto.HMACSHA256(signInput);
  signature = signature.replace(/\+/g, '-');
  signature = signature.replace(/\//g, '_');

  outgoingParams.signature = signature;
}

module.exports = exports['default'];
//# sourceMappingURL=endpoint.js.map
