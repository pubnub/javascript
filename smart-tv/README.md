# SmartTV JavaScript SDK for Sony, Philips, LG, Samsung and more!

## PubNub JavaScript SDK Usage

You may access the latest PubNub JavaScript SDK on The PubNub Network CDN.

```html
<script src=pubnub.min.js ></script>
<script>(function(){

    var pubnub = PUBNUB.init({
        publish_key   : 'demo',
        subscribe_key : 'demo'
    });

})();</script>
```

## SIMPLE EXAMPLE

>**NOTE:** Copy and paste this example into a *blank* HTML file.

```html
<div id=pubnub pub-key=demo sub-key=demo></div>
<script src=http://cdn.pubnub.com/pubnub-3.4.8.min.js ></script>
<script>

    // LISTEN
    PUBNUB.subscribe({
        channel : "hello_world",
        message : function(m){ alert(m) },
        connect : publish
    })

    // SEND
    function publish() {
        PUBNUB.publish({
            channel : "hello_world",
            message : "Hi."
        })
    }

</script>
```

