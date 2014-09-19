# Real-time Content Curation
### Plus PubNub DataSync SDK

 - See Demo Live: [Real-time Content Curation for Bootstrap](http://pubnub.github.io/bootstrap-content-curator/)
 - Read the Full Docs: [Real-time Content Curation for Bootstrap DataSync SDK Documentation](http://pubnub.github.io/bootstrap-content-curator/#datasync-docs)
 - Register For API Keys: [Signup/Login to PubNub Admin Portal](https://admin.pubnub.com/)

A real-time feed management system that enables 
the rapid broadcasting of headlines 
for applications in social news, social TV, 
social music, social sports, social commerce and social finance.

DataSync is the ability to have apps always be at the same-state 
regardless of point-of-load. 
Upon reconnect, all data is re-synced with the client app. 
Your data is replicated to all data centers and optionally encrypted.

```html
<script src="http://cdn.pubnub.com/pubnub.min.js"></script>
<script src="http://cdn.pubnub.com/pubnub-crypto.min.js"></script>
<script src="http://pubnub.github.io/bootstrap-content-curator/dist/js/pubnub-sync.js"></script>
<script>(function(){
    var settings = {
        publish_key   : 'pub-5ad63a7a-0c72-4b86-978d-960dcdb971e1'
    ,   subscribe_key : 'sub-459a5e4a-9de6-11e0-982f-efe715a9b6b8'
    ,   secret_key    : 'sec-fa847381-dcdb-4bcf-a8aa-7b812c390441'
    ,   cipher_key    : 'ODgwNDsmIzczMDustKOiJiM4NzM0O7aqSDNh2mig'
    ,   ssl           : true
    };

    // Connect to DataSync DB
    var db = PUBNUB.sync( 'db-admin', settings );

    // View All Items in DB
    db.all(function(item){       /* -- render all items  -- */ });

    // Register All Callback Events
    db.on.create(function(item){ /* -- new item          -- */ });
    db.on.update(function(item){ /* -- updated item      -- */ });
    db.on.delete(function(item){ /* -- removed item      -- */ });

    // Create Item
    var item = db.create({ headline : "Hello!" });

    // Update Item
    item.update({ headline : "Hello Update!" });

    // Delete Item
    item.delete();
})();</script>
```
