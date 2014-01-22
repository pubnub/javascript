var pubnub = require('../pubnub.js').init({})

function error(result) {
    console.log( 'Error with', result  }

console.log('Publishing... Waiting for Result!\n')

pubnub.publish({
    channel  : 'bbq',
    message  : { 'hah?' : 'lol' },
    callback : function(result){ console.log(result) },
    error    : error
})
