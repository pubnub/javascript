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
export var PubNubMessageType;
(function (PubNubMessageType) {
    /**
     * Regular message.
     */
    PubNubMessageType[PubNubMessageType["Message"] = -1] = "Message";
    /**
     * File message.
     */
    PubNubMessageType[PubNubMessageType["Files"] = 4] = "Files";
})(PubNubMessageType || (PubNubMessageType = {}));
// endregion
