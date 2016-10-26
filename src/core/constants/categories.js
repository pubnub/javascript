/* @flow */
export default {
  // SDK will announce when the network appears to be connected again.
  PNNetworkUpCategory: 'PNNetworkUpCategory',

  // SDK will announce when the network appears to down.
  PNNetworkDownCategory: 'PNNetworkDownCategory',

  // call failed when network was unable to complete the call.
  PNNetworkIssuesCategory: 'PNNetworkIssuesCategory',

  // network call timed out
  PNTimeoutCategory: 'PNTimeoutCategory',

  // server responded with bad response
  PNBadRequestCategory: 'PNBadRequestCategory',

  // server responded with access denied
  PNAccessDeniedCategory: 'PNAccessDeniedCategory',

  // something strange happened; please check the logs.
  PNUnknownCategory: 'PNUnknownCategory',

  // on reconnection
  PNReconnectedCategory: 'PNReconnectedCategory',

  PNConnectedCategory: 'PNConnectedCategory',

  PNRequestMessageCountExceededCategory: 'PNRequestMessageCountExceededCategory'

};
