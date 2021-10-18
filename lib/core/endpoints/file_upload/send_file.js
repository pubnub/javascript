"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _endpoint = require("../../components/endpoint");

var getErrorFromResponse = function getErrorFromResponse(response) {
  return new Promise(function (resolve) {
    var result = '';
    response.on('data', function (data) {
      result += data.toString('utf8');
    });
    response.on('end', function () {
      resolve(result);
    });
  });
};

var sendFile = function sendFile(_ref) {
  var generateUploadUrl = _ref.generateUploadUrl,
      publishFile = _ref.publishFile,
      _ref$modules = _ref.modules,
      PubNubFile = _ref$modules.PubNubFile,
      config = _ref$modules.config,
      cryptography = _ref$modules.cryptography,
      networking = _ref$modules.networking;
  return function () {
    var _ref3 = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(_ref2) {
      var channel, input, message, cipherKey, meta, ttl, storeInHistory, file, _yield$generateUpload, _yield$generateUpload2, url, formFields, _yield$generateUpload3, id, name, formFieldsWithMimeType, result, errorBody, reason, retries, wasSuccessful, publishResult;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              channel = _ref2.channel, input = _ref2.file, message = _ref2.message, cipherKey = _ref2.cipherKey, meta = _ref2.meta, ttl = _ref2.ttl, storeInHistory = _ref2.storeInHistory;

              if (channel) {
                _context.next = 3;
                break;
              }

              throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("channel can't be empty"));

            case 3:
              if (input) {
                _context.next = 5;
                break;
              }

              throw new _endpoint.PubNubError('Validation failed, check status for details', (0, _endpoint.createValidationError)("file can't be empty"));

            case 5:
              file = PubNubFile.create(input);
              _context.next = 8;
              return generateUploadUrl({
                channel: channel,
                name: file.name
              });

            case 8:
              _yield$generateUpload = _context.sent;
              _yield$generateUpload2 = _yield$generateUpload.file_upload_request;
              url = _yield$generateUpload2.url;
              formFields = _yield$generateUpload2.form_fields;
              _yield$generateUpload3 = _yield$generateUpload.data;
              id = _yield$generateUpload3.id;
              name = _yield$generateUpload3.name;

              if (!(PubNubFile.supportsEncryptFile && (cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey))) {
                _context.next = 19;
                break;
              }

              _context.next = 18;
              return cryptography.encryptFile(cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey, file, PubNubFile);

            case 18:
              file = _context.sent;

            case 19:
              formFieldsWithMimeType = formFields;

              if (file.mimeType) {
                formFieldsWithMimeType = formFields.map(function (entry) {
                  if (entry.key === 'Content-Type') return {
                    key: entry.key,
                    value: file.mimeType
                  };else return entry;
                });
              }

              _context.prev = 21;

              if (!(PubNubFile.supportsFileUri && input.uri)) {
                _context.next = 34;
                break;
              }

              _context.t0 = networking;
              _context.t1 = url;
              _context.t2 = formFieldsWithMimeType;
              _context.next = 28;
              return file.toFileUri();

            case 28:
              _context.t3 = _context.sent;
              _context.next = 31;
              return _context.t0.POSTFILE.call(_context.t0, _context.t1, _context.t2, _context.t3);

            case 31:
              result = _context.sent;
              _context.next = 71;
              break;

            case 34:
              if (!PubNubFile.supportsFile) {
                _context.next = 46;
                break;
              }

              _context.t4 = networking;
              _context.t5 = url;
              _context.t6 = formFieldsWithMimeType;
              _context.next = 40;
              return file.toFile();

            case 40:
              _context.t7 = _context.sent;
              _context.next = 43;
              return _context.t4.POSTFILE.call(_context.t4, _context.t5, _context.t6, _context.t7);

            case 43:
              result = _context.sent;
              _context.next = 71;
              break;

            case 46:
              if (!PubNubFile.supportsBuffer) {
                _context.next = 58;
                break;
              }

              _context.t8 = networking;
              _context.t9 = url;
              _context.t10 = formFieldsWithMimeType;
              _context.next = 52;
              return file.toBuffer();

            case 52:
              _context.t11 = _context.sent;
              _context.next = 55;
              return _context.t8.POSTFILE.call(_context.t8, _context.t9, _context.t10, _context.t11);

            case 55:
              result = _context.sent;
              _context.next = 71;
              break;

            case 58:
              if (!PubNubFile.supportsBlob) {
                _context.next = 70;
                break;
              }

              _context.t12 = networking;
              _context.t13 = url;
              _context.t14 = formFieldsWithMimeType;
              _context.next = 64;
              return file.toBlob();

            case 64:
              _context.t15 = _context.sent;
              _context.next = 67;
              return _context.t12.POSTFILE.call(_context.t12, _context.t13, _context.t14, _context.t15);

            case 67:
              result = _context.sent;
              _context.next = 71;
              break;

            case 70:
              throw new Error('Unsupported environment');

            case 71:
              _context.next = 80;
              break;

            case 73:
              _context.prev = 73;
              _context.t16 = _context["catch"](21);
              _context.next = 77;
              return getErrorFromResponse(_context.t16.response);

            case 77:
              errorBody = _context.sent;
              reason = /<Message>(.*)<\/Message>/gi.exec(errorBody);
              throw new _endpoint.PubNubError(reason ? "Upload to bucket failed: ".concat(reason[1]) : 'Upload to bucket failed.', _context.t16);

            case 80:
              if (!(result.status !== 204)) {
                _context.next = 82;
                break;
              }

              throw new _endpoint.PubNubError('Upload to bucket was unsuccessful', result);

            case 82:
              retries = config.fileUploadPublishRetryLimit;
              wasSuccessful = false;
              publishResult = {
                timetoken: '0'
              };

            case 85:
              _context.prev = 85;
              _context.next = 88;
              return publishFile({
                channel: channel,
                message: message,
                fileId: id,
                fileName: name,
                meta: meta,
                storeInHistory: storeInHistory,
                ttl: ttl
              });

            case 88:
              publishResult = _context.sent;
              wasSuccessful = true;
              _context.next = 95;
              break;

            case 92:
              _context.prev = 92;
              _context.t17 = _context["catch"](85);
              retries -= 1;

            case 95:
              if (!wasSuccessful && retries > 0) {
                _context.next = 85;
                break;
              }

            case 96:
              if (wasSuccessful) {
                _context.next = 100;
                break;
              }

              throw new _endpoint.PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
                channel: channel,
                id: id,
                name: name
              });

            case 100:
              return _context.abrupt("return", {
                timetoken: publishResult.timetoken,
                id: id,
                name: name
              });

            case 101:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[21, 73], [85, 92]]);
    }));

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }();
};

var _default = function _default(deps) {
  var f = sendFile(deps);
  return function (params, cb) {
    var resultP = f(params);

    if (typeof cb === 'function') {
      resultP.then(function (result) {
        return cb(null, result);
      })["catch"](function (error) {
        return cb(error, null);
      });
      return resultP;
    } else {
      return resultP;
    }
  };
};

exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=send_file.js.map
