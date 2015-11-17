var pubnub = require('pubnub')({
publish_key : 'demo-36',
subscribe_key : 'demo-36',
ssl : false,
origin : 'pubsub.pubnub.com'
});

var channel = "hello_world";

function pub() {
   console.log("Since we’re publishing on subscribe connectEvent, we’re sure we’ll receive the following publish.");
   pubnub.publish({                                    
        channel : channel,
        message : "Hello from PubNub Docs!",
        callback: function(m){ console.log(m); }
   });
}
    
function doClick(e) {
    alert($.label.text);
    
    pubnub.subscribe({                                     
        channel : channel,
        message : function(message,env,ch,timer,magic_ch){
          console.log(
          "Message Received." + '<br>' +
          "Channel: " + ch + '<br>' +
          "Message: " + JSON.stringify(message)  + '<br>' +
          "Raw Envelope: " + JSON.stringify(env) + '<br>' +
          "Magic Channel: " + JSON.stringify(magic_ch)
        );},
        connect: pub
    });
}

$.index.open();
