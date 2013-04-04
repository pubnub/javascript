# PubNub Node.JS SDK and NPM
## PubNub Node.js Usage

Open `./tests/unit-test.js` to see examples for all the basics,
plus `history()`, `presence()` and `here_now()`!

Report an issue, or email us at support if there are any
additional questions or comments.

```javascript
var pubnub = require("./../pubnub.js").init({
    publish_key   : "demo",
    subscribe_key : "demo"
});

/* ---------------------------------------------------------------------------
Listen for Messages
--------------------------------------------------------------------------- */
pubnub.subscribe({
    channel  : "my_channel",
    callback : function(message) {
        console.log( " > ", message );
    }
});

/* ---------------------------------------------------------------------------
Type Console Message
--------------------------------------------------------------------------- */
var stdin = process.openStdin();
stdin.on( 'data', function(chunk) {
    pubnub.publish({
        channel : "my_channel",
        message : ''+chunk
    });
});
```
