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
      modules = _ref.modules;
  return function () {
    var _ref3 = (0, _asyncToGenerator2["default"])(_regenerator["default"].mark(function _callee(_ref2) {
      var channel, input, message, file, _ref4, _ref4$file_upload_req, url, formFields, _ref4$data, id, name, res;

      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              channel = _ref2.channel, input = _ref2.file, message = _ref2.message;

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
              file = modules.getFile().create(input);
              _context.next = 8;
              return generateUploadUrl({
                channel: channel,
                name: file.name
              });

            case 8:
              _ref4 = _context.sent;
              _ref4$file_upload_req = _ref4.file_upload_request;
              url = _ref4$file_upload_req.url;
              formFields = _ref4$file_upload_req.form_fields;
              _ref4$data = _ref4.data;
              id = _ref4$data.id;
              name = _ref4$data.name;
              _context.next = 17;
              return modules.networking.FILE(url, formFields, file.input);

            case 17:
              res = _context.sent;

              if (!(res.status !== 204)) {
                _context.next = 20;
                break;
              }

              throw new Error('upload failed');

            case 20:
              _context.next = 22;
              return publishFile({
                channel: channel,
                message: {
                  message: message,
                  file: {
                    id: id,
                    name: name
                  }
                }
              });

            case 22:
              return _context.abrupt("return", {
                id: id,
                name: name
              });

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
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
