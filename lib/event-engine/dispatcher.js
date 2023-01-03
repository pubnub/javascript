"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.EventEngineDispatcher = void 0;
var endpoint_1 = require("../core/components/endpoint");
var core_1 = require("./core");
var effects = __importStar(require("./effects"));
var events = __importStar(require("./events"));
var EventEngineDispatcher = /** @class */ (function (_super) {
    __extends(EventEngineDispatcher, _super);
    function EventEngineDispatcher(engine, dependencies) {
        var _this = _super.call(this, dependencies) || this;
        _this.on(effects.handshake.type, (0, core_1.asyncHandler)(function (payload, abortSignal, _a) {
            var handshake = _a.handshake;
            return __awaiter(_this, void 0, void 0, function () {
                var result, e_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            abortSignal.throwIfAborted();
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, handshake({
                                    abortSignal: abortSignal,
                                    channels: payload.channels,
                                    channelGroups: payload.groups,
                                })];
                        case 2:
                            result = _b.sent();
                            engine.transition(events.handshakingSuccess(result));
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _b.sent();
                            if (e_1 instanceof Error && e_1.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (e_1 instanceof endpoint_1.PubNubError) {
                                return [2 /*return*/, engine.transition(events.handshakingFailure(e_1))];
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }));
        _this.on(effects.receiveEvents.type, (0, core_1.asyncHandler)(function (payload, abortSignal, _a) {
            var receiveEvents = _a.receiveEvents;
            return __awaiter(_this, void 0, void 0, function () {
                var result, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            abortSignal.throwIfAborted();
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, receiveEvents({
                                    abortSignal: abortSignal,
                                    channels: payload.channels,
                                    channelGroups: payload.groups,
                                    timetoken: payload.cursor.timetoken,
                                    region: payload.cursor.region,
                                })];
                        case 2:
                            result = _b.sent();
                            engine.transition(events.receivingSuccess(result.metadata, result.messages));
                            return [3 /*break*/, 4];
                        case 3:
                            error_1 = _b.sent();
                            if (error_1 instanceof Error && error_1.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (error_1 instanceof endpoint_1.PubNubError) {
                                return [2 /*return*/, engine.transition(events.receivingFailure(error_1))];
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }));
        _this.on(effects.emitEvents.type, (0, core_1.asyncHandler)(function (payload, abortSignal, _a) {
            var receiveEvents = _a.receiveEvents;
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_b) {
                    if (payload.length > 0) {
                        console.log(payload);
                    }
                    return [2 /*return*/];
                });
            });
        }));
        _this.on(effects.reconnect.type, (0, core_1.asyncHandler)(function (payload, abortSignal, _a) {
            var receiveEvents = _a.receiveEvents, shouldRetry = _a.shouldRetry, getRetryDelay = _a.getRetryDelay, delay = _a.delay;
            return __awaiter(_this, void 0, void 0, function () {
                var result, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!shouldRetry(payload.reason, payload.attempts)) {
                                return [2 /*return*/, engine.transition(events.reconnectingGiveup())];
                            }
                            abortSignal.throwIfAborted();
                            return [4 /*yield*/, delay(getRetryDelay(payload.attempts))];
                        case 1:
                            _b.sent();
                            abortSignal.throwIfAborted();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, receiveEvents({
                                    abortSignal: abortSignal,
                                    channels: payload.channels,
                                    channelGroups: payload.groups,
                                    timetoken: payload.cursor.timetoken,
                                    region: payload.cursor.region,
                                })];
                        case 3:
                            result = _b.sent();
                            return [2 /*return*/, engine.transition(events.reconnectingSuccess(result.metadata, result.messages))];
                        case 4:
                            error_2 = _b.sent();
                            if (error_2 instanceof Error && error_2.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (error_2 instanceof endpoint_1.PubNubError) {
                                return [2 /*return*/, engine.transition(events.reconnectingFailure(error_2))];
                            }
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }));
        _this.on(effects.handshakeReconnect.type, (0, core_1.asyncHandler)(function (payload, abortSignal, _a) {
            var handshake = _a.handshake, shouldRetry = _a.shouldRetry, getRetryDelay = _a.getRetryDelay, delay = _a.delay;
            return __awaiter(_this, void 0, void 0, function () {
                var result, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!shouldRetry(payload.reason, payload.attempts)) {
                                return [2 /*return*/, engine.transition(events.handshakingReconnectingGiveup())];
                            }
                            abortSignal.throwIfAborted();
                            return [4 /*yield*/, delay(getRetryDelay(payload.attempts))];
                        case 1:
                            _b.sent();
                            abortSignal.throwIfAborted();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, handshake({
                                    abortSignal: abortSignal,
                                    channels: payload.channels,
                                    channelGroups: payload.groups,
                                })];
                        case 3:
                            result = _b.sent();
                            return [2 /*return*/, engine.transition(events.handshakingReconnectingSuccess(result.metadata))];
                        case 4:
                            error_3 = _b.sent();
                            if (error_3 instanceof Error && error_3.message === 'Aborted') {
                                return [2 /*return*/];
                            }
                            if (error_3 instanceof endpoint_1.PubNubError) {
                                return [2 /*return*/, engine.transition(events.handshakingReconnectingFailure(error_3))];
                            }
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        }));
        return _this;
    }
    return EventEngineDispatcher;
}(core_1.Dispatcher));
exports.EventEngineDispatcher = EventEngineDispatcher;
