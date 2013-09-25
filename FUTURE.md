# PubNub SDK 4.0 Future Feature Spec

This is a guide and a roadmap plan for **V2 Subscribe** `"SDK v4.0"`
which implements new features for higher performance 
throughput and reliability.

## Feature List

 - Simultaneous MultiGeo Connectivity
 - Deduplication

## Envelope Format Example

```javascript
{
    messages : [ { channel : "my_channel", data : PAYLOAD, timetoken : "13437561957685947" } ]
}
```

## SDK API

The following is a new guide for the interfaces available.
