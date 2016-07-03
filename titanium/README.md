# PubNub for JS Docs have been moved to: http://www.pubnub.com/docs/javascript/javascript-sdk.html

### PubNub Real-time Cloud Push API for Titanium

PubNub is a Massively Scalable Real-time Service for Web and Mobile Games.
This is a cloud-based service for broadcasting Real-time messages
to millions of web and mobile clients simultaneously.

#####  Please use the distributable in the `dist` folder

#### API Usage Summary
API Usage summary follows. But checkout the real working examples in examples/mobile

And be sure to checkout how easy it is to run the demo chat application with this quick video demo: 
https://vimeo.com/57166260

### Init

```javascript
PUBNUB = require('pubnub.js');

var pubnub = PUBNUB({
    publish_key       : 'demo',
    subscribe_key     : 'demo',
    ssl               : false,
    native_tcp_socket : false,
    origin            : 'pubsub.pubnub.com'
});
```

If you run into firewall issues on some iPhone deployments, try to set native_tcp_socket to true.

When native_tcp_socket is set to false ( by default it is false ), you might see network activity indicator spinning always.
You can stop the indicator spinning by setting Ti.App.disableNetworkActivityIndicator = true;

### Subscribe and Presence
For a given channel, subscribe to the channel (subscribe), or subscribe to the channel's join/leave events (presence)

```javascript
pubnub.subscribe({
    channel  : "hello_world",
    callback : function(message) { Ti.API.log(message) }
})
```

### Publish
Send messages to a channel.

```javascript
pubnub.publish({
    channel : "hello_world",
    message : "Hi."
})
```

### Message History ( history() is deprecated, please migrate your apps to use detailedHistory instead. )
Get the message history for a channel.

```javascript
        var paramobj = {};
        paramobj['channel'] = channel.value;
        paramobj['callback'] = function(message) {
            append_data( JSON.stringify(message));
        }    
        paramobj.error = function() {
            append_data("Lost connection ... ","#f00");
        }
        if (start.value != "Start Timestamp" && start.value != "") 
            paramobj['start'] = start.value;
        if (end.value != "End Timestamp" && end.value != "") 
            paramobj['end'] = end.value;
        if (count.value != "Count" && count.value != "") 
            paramobj['count'] = count.value;
        else
            paramobj['count'] = 100;
        pubnub.detailedHistory(paramobj);
```
### Here_now
Get real time occupancy stats for a channel. Used complimentarily with Presence

```javascript
        pubnub.here_now({
            channel  : channel.value,
            connect  : function() {
                    append_data("Receiving Here Now data ...");
            },
            callback : function(message) {
                    append_data( JSON.stringify(message) );
            },
            error : function() {
                    append_data( "Lost Connection...", "#f00" );
            }
        });
```
PubNub for JS Docs have been moved to: http://www.pubnub.com/docs/javascript/javascript-sdk.html
