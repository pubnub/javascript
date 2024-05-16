"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubNubMessageType = void 0;
// endregion
// --------------------------------------------------------
// -------------------- Fetch Messages --------------------
// --------------------------------------------------------
// region Fetch Messages
/**
 * PubNub-defined message type.
 *
 * Types of messages which can be retrieved with fetch messages REST API.
 */
var PubNubMessageType;
(function (PubNubMessageType) {
    /**
     * Regular message.
     */
    PubNubMessageType[PubNubMessageType["Message"] = -1] = "Message";
    /**
     * File message.
     */
    PubNubMessageType[PubNubMessageType["Files"] = 4] = "Files";
})(PubNubMessageType || (exports.PubNubMessageType = PubNubMessageType = {}));
// endregion
