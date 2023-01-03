"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var categories_1 = __importDefault(require("../constants/categories"));
var default_1 = /** @class */ (function () {
    function default_1() {
        this._listeners = [];
    }
    default_1.prototype.addListener = function (newListeners) {
        this._listeners.push(newListeners);
    };
    default_1.prototype.removeListener = function (deprecatedListener) {
        var newListeners = [];
        this._listeners.forEach(function (listener) {
            if (listener !== deprecatedListener)
                newListeners.push(listener);
        });
        this._listeners = newListeners;
    };
    default_1.prototype.removeAllListeners = function () {
        this._listeners = [];
    };
    default_1.prototype.announcePresence = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.presence)
                listener.presence(announce);
        });
    };
    default_1.prototype.announceStatus = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.status)
                listener.status(announce);
        });
    };
    default_1.prototype.announceMessage = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.message)
                listener.message(announce);
        });
    };
    default_1.prototype.announceSignal = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.signal)
                listener.signal(announce);
        });
    };
    default_1.prototype.announceMessageAction = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.messageAction)
                listener.messageAction(announce);
        });
    };
    default_1.prototype.announceFile = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.file)
                listener.file(announce);
        });
    };
    default_1.prototype.announceObjects = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.objects)
                listener.objects(announce);
        });
    };
    default_1.prototype.announceUser = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.user)
                listener.user(announce);
        });
    };
    default_1.prototype.announceSpace = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.space)
                listener.space(announce);
        });
    };
    default_1.prototype.announceMembership = function (announce) {
        this._listeners.forEach(function (listener) {
            if (listener.membership)
                listener.membership(announce);
        });
    };
    default_1.prototype.announceNetworkUp = function () {
        var networkStatus = {};
        networkStatus.category = categories_1.default.PNNetworkUpCategory;
        this.announceStatus(networkStatus);
    };
    default_1.prototype.announceNetworkDown = function () {
        var networkStatus = {};
        networkStatus.category = categories_1.default.PNNetworkDownCategory;
        this.announceStatus(networkStatus);
    };
    return default_1;
}());
exports.default = default_1;
