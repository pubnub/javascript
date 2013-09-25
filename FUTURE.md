# PubNub SDK 4.0 Future Feature Spec

This is a guide and a roadmap plan for **V2 Subscribe** `"SDK v4.0"`
which implements new features for higher performance
throughput and reliability.

## Feature List

 - **Journey Analytics**
   - The details of a messages journey over time.
 - **Auto-retry Republish on Failure**
   - Automatically re-publish messages intended to be sent.
 - **Simultaneous MultiGeo Connectivity**
   - Automatic instant zero-downtime connectivity under failure conditions.
   - Configuration options for region residence(s) of connectivity.
 - **De-duplication**
   - The new Subscribe `V2` will deliver possible duplicates with the benefit
     of significant higher message deliverability.
   - Therefore de-duplication mechanisms are automatic.
   - Also with multi-always-on Geo Connections, messages are received more than
     once and will require bubbling only the first message to the user while
     discarding any duplicate messages.
 - **Enhanced SDK API Interface**
   - Simplified SDK interface provides easier usage and manageability.

## Envelope Format Example

```javascript
{
    messages : [
        { channel   : "my_channel",
          data      : PAYLOAD,
          timetoken : "13437561957685947" },
        { channel   : "my_channel",
          data      : PAYLOAD,
          timetoken : "13437561955648731" }
    ]
}
```

## SDK API

The following is a new guide for the interfaces available.

```javascript
// Setup
pubnub = new PubNub({
    connections   : 4,            // MultiGeo Connections
    subscribe_key : "demo",       // Subscribe Key
    publish_key   : "demo",       // Publish Key
    secret_key    : "demo",       // Secret Key for Admin Auth
    auth_key      : "auth",       // Auth Key for PAM R/W
    cipher_key    : "pass",       // AES256 Cipher
    drift_check   : 9000,         // Re-calculate Time Drift
    windowing     : 10,           // Bundle and Order Window (ms)
    timeout       : 310,          // Max Seconds to Force Reconn (s)
    ssl           : false,        // SSL
    analytics     : 'analytics',  // Channel to Save Analytic on
    message       : message,      // onMessage Receive
    activity      : activity,     // onAny Activity
    idle          : idle,         // onPing Idle Message
    error         : error,        // onErrors
    connect       : connect,      // onConnect
    reconnect     : reconnect,    // onReconnect
    disconnect    : disconnect    // onDisconnect
});

// Add Channels
pubnub.subscribe([ 'b', 'c' ]);

```
