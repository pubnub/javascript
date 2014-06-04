
var PNmessage = require("../pubnub.js").PNmessage
var PUBNUB = require("../pubnub.js")
var pubnub = PUBNUB({
	publish_key   : "demo",
	subscribe_key : "demo"
});

var a = PNmessage()

a.pubnub = pubnub;
a.callback = console.log
a.error = console.log
a.channel = 'my_channel'

a.gcm = ['i am gcm array']
a.apns.alert = "this is alert"
a.apns.badge = 2
a.apns.key = "hi am apns"

a.send()


var b = PNmessage()

b.pubnub = pubnub;
b.callback = console.log
b.error = console.log
b.channel = 'my_channel'

b.send()



var c = PNmessage()

c.pubnub = pubnub;
c.callback = console.log
c.error = console.log
c.channel = 'my_channel'

c.gcm = ['i am gcm array']
c.apns.alert = "this is alert"
c.apns.badge = 2
c.apns.key = "hi am apns"
c.mykey = "hi" 

c.send()