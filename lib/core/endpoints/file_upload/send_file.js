"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _endpoint = require("../../components/endpoint");

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
      var channel, input, message, cipherKey, meta, ttl, store, file, _yield$generateUpload, _yield$generateUpload2, url, formFields, _yield$generateUpload3, id, name, formFieldsWithMimeType, result, retries, wasSuccessful;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              channel = _ref2.channel, input = _ref2.file, message = _ref2.message, cipherKey = _ref2.cipherKey, meta = _ref2.meta, ttl = _ref2.ttl, store = _ref2.store;

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

              if (!(cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey)) {
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
                  var _file$mimeType;

                  if (entry.key === 'Content-Type') return {
                    key: entry.key,
                    value: (_file$mimeType = file.mimeType) !== null && _file$mimeType !== void 0 ? _file$mimeType : ''
                  };else return entry;
                });
              }

              _context.prev = 21;

              if (!(typeof Blob !== 'undefined')) {
                _context.next = 34;
                break;
              }

              _context.t0 = networking;
              _context.t1 = url;
              _context.t2 = formFieldsWithMimeType;
              _context.next = 28;
              return file.toFile();

            case 28:
              _context.t3 = _context.sent;
              _context.next = 31;
              return _context.t0.FILE.call(_context.t0, _context.t1, _context.t2, _context.t3);

            case 31:
              result = _context.sent;
              _context.next = 43;
              break;

            case 34:
              _context.t4 = networking;
              _context.t5 = url;
              _context.t6 = formFieldsWithMimeType;
              _context.next = 39;
              return file.toBuffer();

            case 39:
              _context.t7 = _context.sent;
              _context.next = 42;
              return _context.t4.FILE.call(_context.t4, _context.t5, _context.t6, _context.t7);

            case 42:
              result = _context.sent;

            case 43:
              _context.next = 48;
              break;

            case 45:
              _context.prev = 45;
              _context.t8 = _context["catch"](21);
              throw new _endpoint.PubNubError('Upload to bucket failed', _context.t8);

            case 48:
              if (!(result.status !== 204)) {
                _context.next = 50;
                break;
              }

              throw new _endpoint.PubNubError('Upload to bucket was unsuccessful', result);

            case 50:
              retries = 5;
              wasSuccessful = false;

            case 52:
              if (!(!wasSuccessful && retries > 0)) {
                _context.next = 64;
                break;
              }

              _context.prev = 53;
              _context.next = 56;
              return publishFile({
                channel: channel,
                message: message,
                fileId: id,
                fileName: name,
                meta: meta,
                store: store,
                ttl: ttl
              });

            case 56:
              wasSuccessful = true;
              _context.next = 62;
              break;

            case 59:
              _context.prev = 59;
              _context.t9 = _context["catch"](53);
              retries -= 1;

            case 62:
              _context.next = 52;
              break;

            case 64:
              if (wasSuccessful) {
                _context.next = 68;
                break;
              }

              throw new _endpoint.PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
                channel: channel,
                id: id,
                name: name
              });

            case 68:
              return _context.abrupt("return", {
                id: id,
                name: name
              });

            case 69:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[21, 45], [53, 59]]);
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
