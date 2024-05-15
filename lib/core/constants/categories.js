"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Request processing status categories.
 */
var StatusCategory;
(function (StatusCategory) {
    /**
     * Call failed when network was unable to complete the call.
     */
    StatusCategory["PNNetworkIssuesCategory"] = "PNNetworkIssuesCategory";
    /**
     * Network call timed out.
     */
    StatusCategory["PNTimeoutCategory"] = "PNTimeoutCategory";
    /**
     * Request has been cancelled.
     */
    StatusCategory["PNCancelledCategory"] = "PNCancelledCategory";
    /**
     * Server responded with bad response.
     */
    StatusCategory["PNBadRequestCategory"] = "PNBadRequestCategory";
    /**
     * Server responded with access denied.
     */
    StatusCategory["PNAccessDeniedCategory"] = "PNAccessDeniedCategory";
    /**
     * Incomplete parameters provided for used endpoint.
     */
    StatusCategory["PNValidationErrorCategory"] = "PNValidationErrorCategory";
    /**
     * PubNub request acknowledgment status.
     *
     * Some API endpoints respond with request processing status w/o useful data.
     */
    StatusCategory["PNAcknowledgmentCategory"] = "PNAcknowledgmentCategory";
    /**
     * Something strange happened; please check the logs.
     */
    StatusCategory["PNUnknownCategory"] = "PNUnknownCategory";
    // --------------------------------------------------------
    // --------------------- Network status -------------------
    // --------------------------------------------------------
    /**
     * SDK will announce when the network appears to be connected again.
     */
    StatusCategory["PNNetworkUpCategory"] = "PNNetworkUpCategory";
    /**
     * SDK will announce when the network appears to down.
     */
    StatusCategory["PNNetworkDownCategory"] = "PNNetworkDownCategory";
    // --------------------------------------------------------
    // -------------------- Real-time events ------------------
    // --------------------------------------------------------
    /**
     * PubNub client reconnected to the real-time updates stream.
     */
    StatusCategory["PNReconnectedCategory"] = "PNReconnectedCategory";
    /**
     * PubNub client connected to the real-time updates stream.
     */
    StatusCategory["PNConnectedCategory"] = "PNConnectedCategory";
    /**
     * Received real-time updates exceed specified threshold.
     *
     * After temporary disconnection and catchup, this category means that potentially some
     * real-time updates have been pushed into `storage` and need to be requested separately.
     */
    StatusCategory["PNRequestMessageCountExceededCategory"] = "PNRequestMessageCountExceededCategory";
    /**
     * PubNub client disconnected from the real-time updates streams.
     */
    StatusCategory["PNDisconnectedCategory"] = "PNDisconnectedCategory";
    /**
     * PubNub client wasn't able to connect to the real-time updates streams.
     */
    StatusCategory["PNConnectionErrorCategory"] = "PNConnectionErrorCategory";
    /**
     * PubNub client unexpectedly disconnected from the real-time updates streams.
     */
    StatusCategory["PNDisconnectedUnexpectedlyCategory"] = "PNDisconnectedUnexpectedlyCategory";
})(StatusCategory || (StatusCategory = {}));
exports.default = StatusCategory;
