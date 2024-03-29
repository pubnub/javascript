"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendFileRequest = void 0;
var generate_upload_url_1 = require("./generate_upload_url");
var PubNubError_1 = require("../../../models/PubNubError");
var operations_1 = __importDefault(require("../../constants/operations"));
var api_1 = require("../../types/api");
var upload_file_1 = require("./upload-file");
// endregion
/**
 * Send file composed request.
 */
var SendFileRequest = /** @class */ (function () {
    function SendFileRequest(parameters) {
        var _a;
        this.parameters = parameters;
        this.file = (_a = this.parameters.PubNubFile) === null || _a === void 0 ? void 0 : _a.create(parameters.file);
        if (!this.file)
            throw new Error('File upload error: unable to create File object.');
    }
    /**
     * Process user-input and upload file.
     *
     * @returns File upload request response.
     */
    SendFileRequest.prototype.process = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fileName, fileId;
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.generateFileUploadUrl()
                        .then(function (result) {
                        fileName = result.name;
                        fileId = result.id;
                        return _this.uploadFile(result);
                    })
                        .then(function () { return _this.publishFileMessage(fileId, fileName); })
                        .catch(function (error) {
                        var errorStatus = api_1.PubNubAPIError.create(error).toStatus(operations_1.default.PNPublishFileOperation);
                        throw new PubNubError_1.PubNubError('File upload error.', errorStatus);
                    })];
            });
        });
    };
    /**
     * Generate pre-signed file upload Url.
     *
     * @returns File upload credentials.
     */
    SendFileRequest.prototype.generateFileUploadUrl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var request;
            return __generator(this, function (_a) {
                request = new generate_upload_url_1.GenerateFileUploadUrlRequest(__assign(__assign({}, this.parameters), { name: this.file.name, keySet: this.parameters.keySet }));
                return [2 /*return*/, this.parameters.sendRequest(request)];
            });
        });
    };
    /**
     * Prepare and upload {@link PubNub} File object to remote storage.
     *
     * @param uploadParameters - File upload request parameters.
     *
     * @returns
     */
    SendFileRequest.prototype.uploadFile = function (uploadParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cipherKey, PubNubFile, crypto, cryptography, id, name, url, formFields, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this.parameters, cipherKey = _a.cipherKey, PubNubFile = _a.PubNubFile, crypto = _a.crypto, cryptography = _a.cryptography;
                        id = uploadParameters.id, name = uploadParameters.name, url = uploadParameters.url, formFields = uploadParameters.formFields;
                        if (!this.parameters.PubNubFile.supportsEncryptFile) return [3 /*break*/, 4];
                        if (!(!cipherKey && crypto)) return [3 /*break*/, 2];
                        _b = this;
                        return [4 /*yield*/, crypto.encryptFile(this.file, PubNubFile)];
                    case 1:
                        _b.file = (_d.sent());
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(cipherKey && cryptography)) return [3 /*break*/, 4];
                        _c = this;
                        return [4 /*yield*/, cryptography.encryptFile(cipherKey, this.file, PubNubFile)];
                    case 3:
                        _c.file = (_d.sent());
                        _d.label = 4;
                    case 4: return [2 /*return*/, this.parameters.sendRequest(new upload_file_1.UploadFileRequest({
                            fileId: id,
                            fileName: name,
                            file: this.file,
                            uploadUrl: url,
                            formFields: formFields,
                        }))];
                }
            });
        });
    };
    SendFileRequest.prototype.publishFileMessage = function (fileId, fileName) {
        return __awaiter(this, void 0, void 0, function () {
            var result, retries, wasSuccessful, _1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = { timetoken: '0' };
                        retries = this.parameters.fileUploadPublishRetryLimit;
                        wasSuccessful = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.parameters.publishFile(__assign(__assign({}, this.parameters), { fileId: fileId, fileName: fileName }))];
                    case 2:
                        result = _a.sent();
                        wasSuccessful = true;
                        return [3 /*break*/, 4];
                    case 3:
                        _1 = _a.sent();
                        retries -= 1;
                        return [3 /*break*/, 4];
                    case 4:
                        if (!wasSuccessful && retries > 0) return [3 /*break*/, 1];
                        _a.label = 5;
                    case 5:
                        if (!wasSuccessful) {
                            throw new PubNubError_1.PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', { error: true, channel: this.parameters.channel, id: fileId, name: fileName });
                        }
                        else
                            return [2 /*return*/, { status: 200, timetoken: result.timetoken, id: fileId, name: fileName }];
                        return [2 /*return*/];
                }
            });
        });
    };
    return SendFileRequest;
}());
exports.SendFileRequest = SendFileRequest;
