"use strict";
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
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
var endpoint_1 = require("../../components/endpoint");
var getErrorFromResponse = function (response) {
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
var sendFile = function (_a) {
    var _this = this;
    var generateUploadUrl = _a.generateUploadUrl, publishFile = _a.publishFile, _b = _a.modules, PubNubFile = _b.PubNubFile, config = _b.config, cryptography = _b.cryptography, networking = _b.networking;
    return function (_a) {
        var channel = _a.channel, input = _a.file, message = _a.message, cipherKey = _a.cipherKey, meta = _a.meta, ttl = _a.ttl, storeInHistory = _a.storeInHistory;
        return __awaiter(_this, void 0, void 0, function () {
            var file, _b, _c, url, formFields, _d, id, name, formFieldsWithMimeType, result, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, e_1, errorBody, reason, retries, wasSuccessful, publishResult, e_2;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        if (!channel) {
                            throw new endpoint_1.PubNubError('Validation failed, check status for details', (0, endpoint_1.createValidationError)("channel can't be empty"));
                        }
                        if (!input) {
                            throw new endpoint_1.PubNubError('Validation failed, check status for details', (0, endpoint_1.createValidationError)("file can't be empty"));
                        }
                        file = PubNubFile.create(input);
                        return [4 /*yield*/, generateUploadUrl({ channel: channel, name: file.name })];
                    case 1:
                        _b = _s.sent(), _c = _b.file_upload_request, url = _c.url, formFields = _c.form_fields, _d = _b.data, id = _d.id, name = _d.name;
                        if (!(PubNubFile.supportsEncryptFile && (cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey))) return [3 /*break*/, 3];
                        return [4 /*yield*/, cryptography.encryptFile(cipherKey !== null && cipherKey !== void 0 ? cipherKey : config.cipherKey, file, PubNubFile)];
                    case 2:
                        file = _s.sent();
                        _s.label = 3;
                    case 3:
                        formFieldsWithMimeType = formFields;
                        if (file.mimeType) {
                            formFieldsWithMimeType = formFields.map(function (entry) {
                                if (entry.key === 'Content-Type')
                                    return { key: entry.key, value: file.mimeType };
                                return entry;
                            });
                        }
                        _s.label = 4;
                    case 4:
                        _s.trys.push([4, 18, , 20]);
                        if (!(PubNubFile.supportsFileUri && input.uri)) return [3 /*break*/, 7];
                        _f = (_e = networking).POSTFILE;
                        _g = [url, formFieldsWithMimeType];
                        return [4 /*yield*/, file.toFileUri()];
                    case 5: return [4 /*yield*/, _f.apply(_e, _g.concat([_s.sent()]))];
                    case 6:
                        result = _s.sent();
                        return [3 /*break*/, 17];
                    case 7:
                        if (!PubNubFile.supportsFile) return [3 /*break*/, 10];
                        _j = (_h = networking).POSTFILE;
                        _k = [url, formFieldsWithMimeType];
                        return [4 /*yield*/, file.toFile()];
                    case 8: return [4 /*yield*/, _j.apply(_h, _k.concat([_s.sent()]))];
                    case 9:
                        result = _s.sent();
                        return [3 /*break*/, 17];
                    case 10:
                        if (!PubNubFile.supportsBuffer) return [3 /*break*/, 13];
                        _m = (_l = networking).POSTFILE;
                        _o = [url, formFieldsWithMimeType];
                        return [4 /*yield*/, file.toBuffer()];
                    case 11: return [4 /*yield*/, _m.apply(_l, _o.concat([_s.sent()]))];
                    case 12:
                        result = _s.sent();
                        return [3 /*break*/, 17];
                    case 13:
                        if (!PubNubFile.supportsBlob) return [3 /*break*/, 16];
                        _q = (_p = networking).POSTFILE;
                        _r = [url, formFieldsWithMimeType];
                        return [4 /*yield*/, file.toBlob()];
                    case 14: return [4 /*yield*/, _q.apply(_p, _r.concat([_s.sent()]))];
                    case 15:
                        result = _s.sent();
                        return [3 /*break*/, 17];
                    case 16: throw new Error('Unsupported environment');
                    case 17: return [3 /*break*/, 20];
                    case 18:
                        e_1 = _s.sent();
                        return [4 /*yield*/, getErrorFromResponse(e_1.response)];
                    case 19:
                        errorBody = _s.sent();
                        reason = /<Message>(.*)<\/Message>/gi.exec(errorBody);
                        throw new endpoint_1.PubNubError(reason ? "Upload to bucket failed: ".concat(reason[1]) : 'Upload to bucket failed.', e_1);
                    case 20:
                        if (result.status !== 204) {
                            throw new endpoint_1.PubNubError('Upload to bucket was unsuccessful', result);
                        }
                        retries = config.fileUploadPublishRetryLimit;
                        wasSuccessful = false;
                        publishResult = { timetoken: '0' };
                        _s.label = 21;
                    case 21:
                        _s.trys.push([21, 23, , 24]);
                        return [4 /*yield*/, publishFile({
                                channel: channel,
                                message: message,
                                fileId: id,
                                fileName: name,
                                meta: meta,
                                storeInHistory: storeInHistory,
                                ttl: ttl,
                            })];
                    case 22:
                        /* eslint-disable-next-line no-await-in-loop */
                        publishResult = _s.sent();
                        wasSuccessful = true;
                        return [3 /*break*/, 24];
                    case 23:
                        e_2 = _s.sent();
                        retries -= 1;
                        return [3 /*break*/, 24];
                    case 24:
                        if (!wasSuccessful && retries > 0) return [3 /*break*/, 21];
                        _s.label = 25;
                    case 25:
                        if (!wasSuccessful) {
                            throw new endpoint_1.PubNubError('Publish failed. You may want to execute that operation manually using pubnub.publishFile', {
                                channel: channel,
                                id: id,
                                name: name,
                            });
                        }
                        else {
                            return [2 /*return*/, {
                                    timetoken: publishResult.timetoken,
                                    id: id,
                                    name: name,
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
};
exports.default = (function (deps) {
    var f = sendFile(deps);
    return function (params, cb) {
        var resultP = f(params);
        if (typeof cb === 'function') {
            resultP.then(function (result) { return cb(null, result); }).catch(function (error) { return cb(error, null); });
            return resultP;
        }
        return resultP;
    };
});
