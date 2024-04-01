/**
 * Request processing status categories.
 */
enum StatusCategory {
  /**
   * Call failed when network was unable to complete the call.
   */
  PNNetworkIssuesCategory = 'PNNetworkIssuesCategory',

  /**
   * Network call timed out.
   */
  PNTimeoutCategory = 'PNTimeoutCategory',

  /**
   * Request has been cancelled.
   */
  PNCancelledCategory = 'PNCancelledCategory',

  /**
   * Server responded with bad response.
   */
  PNBadRequestCategory = 'PNBadRequestCategory',

  /**
   * Server responded with access denied.
   */
  PNAccessDeniedCategory = 'PNAccessDeniedCategory',

  /**
   * Incomplete parameters provided for used endpoint.
   */
  PNValidationErrorCategory = 'PNValidationErrorCategory',

  /**
   * PubNub request acknowledgment status.
   *
   * Some API endpoints respond with request processing status w/o useful data.
   */
  PNAcknowledgmentCategory = 'PNAcknowledgmentCategory',

  /**
   * Something strange happened; please check the logs.
   */
  PNUnknownCategory = 'PNUnknownCategory',

  // --------------------------------------------------------
  // --------------------- Network status -------------------
  // --------------------------------------------------------

  /**
   * SDK will announce when the network appears to be connected again.
   */
  PNNetworkUpCategory = 'PNNetworkUpCategory',

  /**
   * SDK will announce when the network appears to down.
   */
  PNNetworkDownCategory = 'PNNetworkDownCategory',

  // --------------------------------------------------------
  // -------------------- Real-time events ------------------
  // --------------------------------------------------------

  /**
   * PubNub client reconnected to the real-time updates stream.
   */
  PNReconnectedCategory = 'PNReconnectedCategory',

  /**
   * PubNub client connected to the real-time updates stream.
   */
  PNConnectedCategory = 'PNConnectedCategory',

  /**
   * Received real-time updates exceed specified threshold.
   *
   * After temporary disconnection and catchup, this category means that potentially some
   * real-time updates have been pushed into `storage` and need to be requested separately.
   */
  PNRequestMessageCountExceededCategory = 'PNRequestMessageCountExceededCategory',

  /**
   * PubNub client disconnected from the real-time updates streams.
   */
  PNDisconnectedCategory = 'PNDisconnectedCategory',

  /**
   * PubNub client wasn't able to connect to the real-time updates streams.
   */
  PNConnectionErrorCategory = 'PNConnectionErrorCategory',

  /**
   * PubNub client unexpectedly disconnected from the real-time updates streams.
   */
  PNDisconnectedUnexpectedlyCategory = 'PNDisconnectedUnexpectedlyCategory',
}

export default StatusCategory;
