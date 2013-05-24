# SmartTV PubNub JavaScript SDK for Sony, Philips, LG, Samsung, Westinghouse and VIZIO!

## Simple Example

>**NOTE:** Copy and paste this example into a *blank* HTML file.

```html
<script src=pubnub.min.js ></script>
<script>(function(){

    var pubnub = PUBNUB.init({
        publish_key   : 'demo',
        subscribe_key : 'demo'
    });

    // LISTEN
    pubnub.subscribe({
        channel : "hello_world",
        message : function(m){ alert(m) },
        connect : publish
    })

    // SEND
    function publish() {
        pubnub.publish({
            channel : "hello_world",
            message : "Hi."
        })
    }

})();</script>
```

