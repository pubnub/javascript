
var PNmessage = require("../pubnub.js").PNmessage
var PUBNUB = require("../pubnub.js")
var pubnub = PUBNUB({
	publish_key   : "demo-36",
	subscribe_key : "demo-36",
	origin : "gcm-beta.pubnub.com"
});

// Create a pubnub message
var a = PNmessage()

// set pubnub object for pubnub message
a.pubnub = pubnub;

// set callback method 
a.callback = console.log

// set error callback method
a.error = console.log

// set channel
a.channel = 'push'




// populating apns info

a.apns.alert = "this is alert"
a.apns.badge = 2
a.apns.key = "hi am apns"
// publish
a.send()


// populating gcm info
a.gcm = ['i am gcm array']
// publish
a.send()


// populating common info
a.mykey = "hi"
// publish
a.send()






// populating all info in one go and publishing
var c = PNmessage()

c.pubnub = pubnub;
c.callback = console.log
c.error = console.log
c.channel = 'push'

c.gcm = {"message":"be sure not to send objects!", "foo":"bar" }
c.apns.alert = "this is alert"
c.apns.badge = 2
c.apns.key = "hi am apns"
c.mykey = "hi" 

c.send()
